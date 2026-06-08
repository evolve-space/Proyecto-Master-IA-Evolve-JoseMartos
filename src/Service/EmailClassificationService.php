<?php

namespace App\Service;

use App\Dto\EmailClassificationResult;
use App\Entity\Contrato;
use App\Entity\Email;
use App\Entity\EmailCategoria;
use App\Entity\Importacion;
use App\Entity\Muestra;
use App\Entity\Oferta;
use App\Entity\Proveedor;
use App\Repository\ContratoRepository;
use App\Repository\EmailCategoriaRepository;
use App\Repository\ImportacionRepository;
use App\Repository\MuestraRepository;
use App\Repository\OfertaRepository;
use App\Repository\ProveedorRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class EmailClassificationService
{
    private const RULE_CONFIDENCE_THRESHOLD = 0.72;
    private const AI_CONFIDENCE_THRESHOLD = 0.65;

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly EmailCategoriaRepository $categoriaRepository,
        private readonly ProveedorRepository $proveedorRepository,
        private readonly ImportacionRepository $importacionRepository,
        private readonly MuestraRepository $muestraRepository,
        private readonly OfertaRepository $ofertaRepository,
        private readonly ContratoRepository $contratoRepository,
        private readonly HttpClientInterface $httpClient,
        private readonly string $openAiApiKey,
        private readonly string $openAiModel,
    ) {
    }

    public function classifyAndApply(Email $email, bool $force = false): EmailClassificationResult
    {
        if (!$force && $email->getClassificationSource() !== null && $email->getClassificationSource() !== '') {
            return new EmailClassificationResult(
                $this->detectEntityType($email),
                $this->detectEntityId($email),
                $email->getUrgency(),
                $email->getCategoria()?->getNombre(),
                1.0,
                (string) $email->getClassificationSource(),
                (string) ($email->getClassificationReason() ?? 'Ya clasificado'),
            );
        }

        $text = $this->buildSearchText($email);
        $proveedor = $email->getProveedor();

        $rules = $this->classifyByRules($text, $proveedor);
        $result = $rules->confidence >= self::RULE_CONFIDENCE_THRESHOLD
            ? $rules
            : $this->mergeResults($rules, $this->classifyByAi($email, $text, $proveedor));

        $this->applyResult($email, $result);
        $this->em->flush();

        return $result;
    }

    private function buildSearchText(Email $email): string
    {
        $body = strip_tags($email->getBody());

        return mb_strtolower($email->getSubject()."\n".$body);
    }

    private function classifyByRules(string $text, ?Proveedor $proveedor): EmailClassificationResult
    {
        $urgency = $this->detectUrgencyByRules($text);
        $scores = [
            'importacion' => $this->scoreKeywords($text, ['dua', 'despacho', 'arancel', 'forwarder', 'bill of lading', 'bl ', 'importacion', 'importación', 'transitario', 'aduana', 'flete']),
            'muestra' => $this->scoreKeywords($text, ['muestra', 'lote', 'analisis', 'análisis', 'calidad', 'halal', 'kosher', 'bio ', 'food grade', 'laboratorio']),
            'oferta' => $this->scoreKeywords($text, ['oferta', 'cotizacion', 'cotización', 'precio', 'quote', 'quotation', 'propuesta economica', 'propuesta económica']),
            'contrato' => $this->scoreKeywords($text, ['contrato', 'vigencia', 'renovacion', 'renovación', 'acuerdo marco', 'numero de contrato', 'nº contrato']),
            'proveedor' => $proveedor !== null ? 0.35 : $this->scoreKeywords($text, ['proveedor', 'fabricante', 'distribuidor', 'supplier']),
        ];

        arsort($scores);
        $entityType = array_key_first($scores);
        $topScore = $scores[$entityType] ?? 0.0;

        if ($topScore < 0.2 && $proveedor !== null) {
            $entityType = 'proveedor';
            $topScore = 0.5;
        }

        if ($topScore < 0.15) {
            $entityType = 'general';
            $topScore = 0.1;
        }

        $entityId = $this->resolveEntityIdByRules($entityType, $text, $proveedor);
        if ($entityId !== null) {
            $topScore = min(1.0, $topScore + 0.25);
        }

        $categoriaNombre = $this->categoriaForEntityType($entityType, $urgency);

        return new EmailClassificationResult(
            $entityType,
            $entityId,
            $urgency,
            $categoriaNombre,
            round(min(1.0, $topScore), 2),
            'rules',
            sprintf('Reglas: tipo=%s, urgencia=%s', $entityType, $urgency),
        );
    }

    private function classifyByAi(Email $email, string $text, ?Proveedor $proveedor): EmailClassificationResult
    {
        $apiKey = trim($this->openAiApiKey);
        if ($apiKey === '') {
            return new EmailClassificationResult(
                $proveedor !== null ? 'proveedor' : 'general',
                $proveedor?->getId(),
                'normal',
                $proveedor !== null ? 'Proveedores' : null,
                0.3,
                'rules',
                'OPENAI_API_KEY no configurada; solo reglas.',
            );
        }

        $context = $this->buildAiContext($proveedor);
        $snippet = mb_substr($text, 0, 3500);

        $system = <<<'PROMPT'
Clasificas correos de un SRM de compras. Responde SOLO JSON valido:
{"entityType":"proveedor|importacion|muestra|oferta|contrato|general","entityId":null,"urgency":"baja|normal|alta","confidence":0.0,"reason":"..."}
entityId debe ser un id numerico de la lista de contexto o null si no hay match claro.
urgency alta si hay plazos cortos, urgente, ASAP, problema grave.
PROMPT;

        $user = "Remitente: {$email->getSender()}\nAsunto: {$email->getSubject()}\n\nCuerpo:\n{$snippet}\n\n{$context}";

        try {
            $response = $this->httpClient->request('POST', 'https://api.openai.com/v1/chat/completions', [
                'headers' => [
                    'Authorization' => 'Bearer '.$apiKey,
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'model' => $this->openAiModel,
                    'messages' => [
                        ['role' => 'system', 'content' => $system],
                        ['role' => 'user', 'content' => $user],
                    ],
                    'temperature' => 0,
                    'max_tokens' => 200,
                ],
                'timeout' => 25,
            ]);

            $data = $response->toArray(false);
            $content = trim((string) ($data['choices'][0]['message']['content'] ?? '{}'));
            $content = preg_replace('/^```[a-z]*\n?|\n?```$/i', '', $content) ?? $content;
            $parsed = json_decode($content, true);
            if (!is_array($parsed)) {
                throw new \RuntimeException('JSON invalido de OpenAI');
            }

            $entityType = $this->normalizeEntityType((string) ($parsed['entityType'] ?? 'general'));
            $entityId = isset($parsed['entityId']) && is_numeric($parsed['entityId']) ? (int) $parsed['entityId'] : null;
            $urgency = $this->normalizeUrgency((string) ($parsed['urgency'] ?? 'normal'));
            $confidence = (float) ($parsed['confidence'] ?? 0.7);
            $reason = trim((string) ($parsed['reason'] ?? 'Clasificado por IA'));

            if ($entityId !== null && !$this->entityExists($entityType, $entityId)) {
                $entityId = null;
                $confidence *= 0.6;
            }

            return new EmailClassificationResult(
                $entityType,
                $entityId,
                $urgency,
                $this->categoriaForEntityType($entityType, $urgency),
                round(min(1.0, max(0.0, $confidence)), 2),
                'ai',
                $reason,
            );
        } catch (\Throwable $e) {
            return new EmailClassificationResult(
                $proveedor !== null ? 'proveedor' : 'general',
                $proveedor?->getId(),
                $this->detectUrgencyByRules($text),
                $proveedor !== null ? 'Proveedores' : null,
                0.4,
                'rules',
                'IA no disponible: '.$e->getMessage(),
            );
        }
    }

    private function mergeResults(EmailClassificationResult $rules, EmailClassificationResult $ai): EmailClassificationResult
    {
        if ($ai->confidence >= self::AI_CONFIDENCE_THRESHOLD) {
            return $ai;
        }

        if ($rules->entityId === null && $ai->entityId !== null && $ai->confidence >= 0.5) {
            return $ai;
        }

        return $rules;
    }

    private function applyResult(Email $email, EmailClassificationResult $result): void
    {
        $email->setUrgency($result->urgency);
        $email->setClassificationSource($result->source);
        $email->setClassificationReason($result->reason);

        $email->setImportacion(null);
        $email->setMuestra(null);
        $email->setOferta(null);
        $email->setContrato(null);

        if ($result->entityId !== null) {
            match ($result->entityType) {
                'importacion' => $email->setImportacion($this->importacionRepository->find($result->entityId)),
                'muestra' => $email->setMuestra($this->muestraRepository->find($result->entityId)),
                'oferta' => $email->setOferta($this->ofertaRepository->find($result->entityId)),
                'contrato' => $email->setContrato($this->contratoRepository->find($result->entityId)),
                default => null,
            };
        }

        if ($result->categoriaNombre !== null) {
            $categoria = $this->categoriaRepository->findOneBy(['nombre' => $result->categoriaNombre]);
            if ($categoria instanceof EmailCategoria) {
                $email->setCategoria($categoria);
            }
        }
    }

    public function copyClassificationToCalendarEvent(\App\Entity\CalendarEvent $event, Email $email, \App\Repository\CalendarioCategoriaRepository $calendarioCategoriaRepository): void
    {
        $event->setUrgency($email->getUrgency());
        $event->setImportacion($email->getImportacion());
        $event->setMuestra($email->getMuestra());
        $event->setOferta($email->getOferta());
        $event->setContrato($email->getContrato());
        $event->setProveedor($email->getProveedor() ?? $event->getProveedor());

        $nombre = $email->getCategoria()?->getNombre();
        if ($nombre !== null) {
            $cat = $calendarioCategoriaRepository->findOneBy(['nombre' => $nombre]);
            if ($cat !== null) {
                $event->setCategoria($cat);
            }
        }
    }

    private function detectUrgencyByRules(string $text): string
    {
        if (preg_match('/\b(urgente|urgent|asap|inmediat|crítico|critico|prioridad alta|hoy mismo|deadline|plazo corto)\b/u', $text) === 1) {
            return 'alta';
        }
        if (preg_match('/\b(cuando puedas|sin prisa|informativo|fyi|para tu información|para tu informacion)\b/u', $text) === 1) {
            return 'baja';
        }

        return 'normal';
    }

    private function scoreKeywords(string $text, array $keywords): float
    {
        $score = 0.0;
        foreach ($keywords as $keyword) {
            if (str_contains($text, $keyword)) {
                $score += str_contains($keyword, ' ') ? 0.35 : 0.25;
            }
        }

        return min(1.0, $score);
    }

    private function resolveEntityIdByRules(string $entityType, string $text, ?Proveedor $proveedor): ?int
    {
        if (preg_match('/\b(importacion|importación|muestra|oferta|contrato)\s*[#:]?\s*(\d{1,6})\b/u', $text, $m) === 1) {
            $type = $this->normalizeEntityType($m[1]);
            if ($type === $entityType || $entityType === 'general') {
                $id = (int) $m[2];
                if ($this->entityExists($type, $id)) {
                    return $id;
                }
            }
        }

        return match ($entityType) {
            'importacion' => $this->matchImportacion($text, $proveedor),
            'muestra' => $this->matchMuestra($text, $proveedor),
            'oferta' => $this->matchOferta($text, $proveedor),
            'contrato' => $this->matchContrato($text, $proveedor),
            'proveedor' => $proveedor?->getId(),
            default => null,
        };
    }

    private function matchImportacion(string $text, ?Proveedor $proveedor): ?int
    {
        $candidates = $proveedor !== null
            ? $this->importacionRepository->findBy(['proveedor' => $proveedor], ['id' => 'DESC'], 30)
            : $this->importacionRepository->findBy([], ['id' => 'DESC'], 50);

        return $this->matchByProductOrId($text, $candidates, fn (Importacion $i) => $i->getProducto());
    }

    private function matchMuestra(string $text, ?Proveedor $proveedor): ?int
    {
        $candidates = $proveedor !== null
            ? $this->muestraRepository->findBy(['proveedor' => $proveedor], ['id' => 'DESC'], 30)
            : $this->muestraRepository->findBy([], ['id' => 'DESC'], 50);

        foreach ($candidates as $muestra) {
            if (!$muestra instanceof Muestra) {
                continue;
            }
            $lote = mb_strtolower((string) ($muestra->getIdLote() ?? ''));
            if ($lote !== '' && str_contains($text, $lote)) {
                return $muestra->getId();
            }
        }

        return $this->matchByProductOrId($text, $candidates, fn (Muestra $m) => $m->getProducto());
    }

    private function matchOferta(string $text, ?Proveedor $proveedor): ?int
    {
        $candidates = $proveedor !== null
            ? $this->ofertaRepository->findBy(['proveedor' => $proveedor], ['id' => 'DESC'], 30)
            : $this->ofertaRepository->findBy([], ['id' => 'DESC'], 50);

        return $this->matchByProductOrId($text, $candidates, fn (Oferta $o) => $o->getProducto());
    }

    private function matchContrato(string $text, ?Proveedor $proveedor): ?int
    {
        $candidates = $proveedor !== null
            ? $this->contratoRepository->findBy(['proveedor' => $proveedor], ['id' => 'DESC'], 30)
            : $this->contratoRepository->findBy([], ['id' => 'DESC'], 50);

        foreach ($candidates as $contrato) {
            if (!$contrato instanceof Contrato) {
                continue;
            }
            $num = mb_strtolower((string) ($contrato->getNumeroContrato() ?? ''));
            if ($num !== '' && str_contains($text, mb_strtolower($num))) {
                return $contrato->getId();
            }
        }

        return $this->matchByProductOrId($text, $candidates, fn (Contrato $c) => $c->getProducto());
    }

    /**
     * @param array<int, object> $candidates
     */
    private function matchByProductOrId(string $text, array $candidates, callable $productGetter): ?int
    {
        foreach ($candidates as $item) {
            $producto = mb_strtolower(trim((string) $productGetter($item)));
            if ($producto !== '' && mb_strlen($producto) >= 4 && str_contains($text, $producto)) {
                return method_exists($item, 'getId') ? $item->getId() : null;
            }
        }

        return null;
    }

    private function buildAiContext(?Proveedor $proveedor): string
    {
        $lines = ["Contexto BD (ids reales):"];

        if ($proveedor !== null) {
            $lines[] = "Proveedor vinculado: #{$proveedor->getId()} {$proveedor->getNombre()}";
        }

        foreach (array_slice($this->importacionRepository->findBy([], ['id' => 'DESC'], 8), 0, 8) as $imp) {
            if ($imp instanceof Importacion) {
                $lines[] = sprintf('importacion #%d producto=%s proveedor=%s', $imp->getId(), $imp->getProducto() ?? '-', $imp->getProveedor()?->getNombre() ?? '-');
            }
        }
        foreach (array_slice($this->muestraRepository->findBy([], ['id' => 'DESC'], 6), 0, 6) as $m) {
            if ($m instanceof Muestra) {
                $lines[] = sprintf('muestra #%d lote=%s producto=%s', $m->getId(), $m->getIdLote() ?? '-', $m->getProducto() ?? '-');
            }
        }
        foreach (array_slice($this->ofertaRepository->findBy([], ['id' => 'DESC'], 6), 0, 6) as $o) {
            if ($o instanceof Oferta) {
                $lines[] = sprintf('oferta #%d producto=%s', $o->getId(), $o->getProducto() ?? '-');
            }
        }
        foreach (array_slice($this->contratoRepository->findBy([], ['id' => 'DESC'], 6), 0, 6) as $c) {
            if ($c instanceof Contrato) {
                $lines[] = sprintf('contrato #%d n=%s producto=%s', $c->getId(), $c->getNumeroContrato() ?? '-', $c->getProducto() ?? '-');
            }
        }

        return implode("\n", $lines);
    }

    private function categoriaForEntityType(string $entityType, string $urgency): ?string
    {
        if ($urgency === 'alta') {
            return 'Urgente';
        }

        return match ($entityType) {
            'importacion' => 'Importación',
            'muestra' => 'Muestras',
            'oferta' => 'Ofertas',
            'contrato' => 'Contratos',
            'proveedor' => 'Proveedores',
            default => null,
        };
    }

    private function normalizeEntityType(string $type): string
    {
        $type = mb_strtolower(trim($type));

        return match (true) {
            str_contains($type, 'import') => 'importacion',
            str_contains($type, 'muestra') => 'muestra',
            str_contains($type, 'oferta') => 'oferta',
            str_contains($type, 'contrat') => 'contrato',
            str_contains($type, 'proveedor') => 'proveedor',
            default => 'general',
        };
    }

    private function normalizeUrgency(string $urgency): string
    {
        $urgency = mb_strtolower(trim($urgency));

        return match ($urgency) {
            'alta', 'high', 'urgent', 'urgente' => 'alta',
            'baja', 'low' => 'baja',
            default => 'normal',
        };
    }

    private function entityExists(string $entityType, int $id): bool
    {
        return match ($entityType) {
            'importacion' => $this->importacionRepository->find($id) instanceof Importacion,
            'muestra' => $this->muestraRepository->find($id) instanceof Muestra,
            'oferta' => $this->ofertaRepository->find($id) instanceof Oferta,
            'contrato' => $this->contratoRepository->find($id) instanceof Contrato,
            'proveedor' => $this->proveedorRepository->find($id) instanceof Proveedor,
            default => false,
        };
    }

    private function detectEntityType(Email $email): string
    {
        if ($email->getImportacion() !== null) {
            return 'importacion';
        }
        if ($email->getMuestra() !== null) {
            return 'muestra';
        }
        if ($email->getOferta() !== null) {
            return 'oferta';
        }
        if ($email->getContrato() !== null) {
            return 'contrato';
        }
        if ($email->getProveedor() !== null) {
            return 'proveedor';
        }

        return 'general';
    }

    private function detectEntityId(Email $email): ?int
    {
        return $email->getImportacion()?->getId()
            ?? $email->getMuestra()?->getId()
            ?? $email->getOferta()?->getId()
            ?? $email->getContrato()?->getId()
            ?? $email->getProveedor()?->getId();
    }
}
