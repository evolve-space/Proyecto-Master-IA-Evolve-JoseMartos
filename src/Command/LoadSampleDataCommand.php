<?php

namespace App\Command;

use App\Entity\Contrato;
use App\Entity\Importacion;
use App\Entity\Muestra;
use App\Entity\Oferta;
use App\Entity\Proveedor;
use App\Entity\Usuario;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:load-sample-data',
    description: 'Carga datos de muestra en todas las tablas',
)]
class LoadSampleDataCommand extends Command
{
    public function __construct(private EntityManagerInterface $em)
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        // ── Limpiar tablas antes de cargar ──────────────────────────────────
        $conn = $this->em->getConnection();
        $conn->executeStatement('SET FOREIGN_KEY_CHECKS = 0');
        $conn->executeStatement('TRUNCATE TABLE muestra');
        $conn->executeStatement('TRUNCATE TABLE oferta');
        $conn->executeStatement('TRUNCATE TABLE contrato');
        $conn->executeStatement('TRUNCATE TABLE importacion');
        $conn->executeStatement('TRUNCATE TABLE usuario');
        $conn->executeStatement('TRUNCATE TABLE proveedor');
        $conn->executeStatement('SET FOREIGN_KEY_CHECKS = 1');

        // ── Usuarios (3) ────────────────────────────────────────────────────
        $u1 = (new Usuario())->setNombre('Admin Principal')->setTipo('superadmin');
        $u2 = (new Usuario())->setNombre('María García')->setTipo('admin');
        $u3 = (new Usuario())->setNombre('Carlos López')->setTipo('normal');
        $this->em->persist($u1);
        $this->em->persist($u2);
        $this->em->persist($u3);

        // ── Proveedores (4) ─────────────────────────────────────────────────
        $p1 = (new Proveedor())
            ->setNombre('Quimtec S.A.')
            ->setCifNif('A12345678')
            ->setTelefono('+34 91 234 5678')
            ->setWeb('www.quimtec.es')
            ->setActividad('Química industrial')
            ->setDireccionFacturacion('Calle Mayor 10, 28001 Madrid')
            ->setTipo('Fabricante')
            ->setCertificaciones('BIO, HALAL')
            ->setContactoPrincipal('Juan Pérez')
            ->setFormaPago(30)
            ->setEmail('compras@quimtec.es')
            ->setMovil('+34 600 111 222')
            ->setIncoterm('CIF')
            ->setDocumentacion(true)
            ->setObservaciones('Proveedor principal de aditivos');

        $p2 = (new Proveedor())
            ->setNombre('AgroStar GmbH')
            ->setCifNif('DE987654321')
            ->setTelefono('+49 30 555 6789')
            ->setWeb('www.agrostar.de')
            ->setActividad('Ingredientes agrícolas')
            ->setDireccionFacturacion('Hauptstraße 22, 10115 Berlin')
            ->setTipo('Fabricante')
            ->setCertificaciones('FOOD, KOSHER')
            ->setContactoPrincipal('Hans Müller')
            ->setFormaPago(60)
            ->setEmail('sales@agrostar.de')
            ->setMovil('+49 170 333 4444')
            ->setIncoterm('EXW')
            ->setDocumentacion(true);

        $p3 = (new Proveedor())
            ->setNombre('BioDistrib S.L.')
            ->setCifNif('B87654321')
            ->setTelefono('+34 93 456 7890')
            ->setWeb('www.biodistrib.com')
            ->setActividad('Distribución ingredientes bio')
            ->setDireccionFacturacion('Av. Diagonal 200, 08013 Barcelona')
            ->setTipo('Distribuidor')
            ->setCertificaciones('BIO')
            ->setContactoPrincipal('Anna Puig')
            ->setFormaPago(30)
            ->setEmail('info@biodistrib.com')
            ->setMovil('+34 620 555 666')
            ->setIncoterm('CFR')
            ->setDocumentacion(false);

        $p4 = (new Proveedor())
            ->setNombre('NaturaFeed Ltd.')
            ->setCifNif('GB112233445')
            ->setTelefono('+44 20 7946 0958')
            ->setWeb('www.naturafeed.co.uk')
            ->setActividad('Piensos y nutrición animal')
            ->setDireccionFacturacion('10 Downing Lane, London SW1A')
            ->setTipo('Distribuidor')
            ->setCertificaciones('FOOD, HALAL')
            ->setContactoPrincipal('Emily Clark')
            ->setFormaPago(75)
            ->setEmail('emily@naturafeed.co.uk')
            ->setMovil('+44 7700 900123')
            ->setIncoterm('CIP')
            ->setDocumentacion(true)
            ->setObservaciones('Pago aplazado acordado');

        $this->em->persist($p1);
        $this->em->persist($p2);
        $this->em->persist($p3);
        $this->em->persist($p4);

        // ── Contratos (4) ───────────────────────────────────────────────────
        $c1 = (new Contrato())
            ->setFecha(new \DateTime('2025-01-15'))
            ->setNumeroContrato('CONT-2025-001')
            ->setProducto('Ácido cítrico anhidro')
            ->setProveedor($p1)
            ->setPrecio('1.2500')
            ->setGrado('FOOD')
            ->setCantidad('50000.000')
            ->setCantidadPedida('20000.000')
            ->setCantidadPendiente('30000.000')
            ->setFechaCaducidad(new \DateTime('2025-12-31'))
            ->setDocumentacion(true)
            ->setObservaciones('Precio fijo hasta diciembre');

        $c2 = (new Contrato())
            ->setFecha(new \DateTime('2025-03-01'))
            ->setNumeroContrato('CONT-2025-002')
            ->setProducto('Extracto de vainilla BIO')
            ->setProveedor($p2)
            ->setPrecio('45.0000')
            ->setGrado('BIO')
            ->setCantidad('5000.000')
            ->setCantidadPedida('2500.000')
            ->setCantidadPendiente('2500.000')
            ->setFechaCaducidad(new \DateTime('2026-03-01'))
            ->setDocumentacion(true);

        $c3 = (new Contrato())
            ->setFecha(new \DateTime('2025-06-10'))
            ->setNumeroContrato('CONT-2025-003')
            ->setProducto('Lecitina de soja HALAL')
            ->setProveedor($p3)
            ->setPrecio('3.8000')
            ->setGrado('HALAL')
            ->setCantidad('20000.000')
            ->setCantidadPedida('8000.000')
            ->setCantidadPendiente('12000.000')
            ->setFechaCaducidad(new \DateTime('2026-06-10'))
            ->setDocumentacion(false);

        $c4 = (new Contrato())
            ->setFecha(new \DateTime('2025-09-20'))
            ->setNumeroContrato('CONT-2025-004')
            ->setProducto('Proteína de guisante KOSHER')
            ->setProveedor($p4)
            ->setPrecio('5.1500')
            ->setGrado('KOSHER')
            ->setCantidad('15000.000')
            ->setCantidadPedida('5000.000')
            ->setCantidadPendiente('10000.000')
            ->setFechaCaducidad(new \DateTime('2026-09-20'))
            ->setDocumentacion(true)
            ->setObservaciones('Requiere certificado kosher actualizado');

        $this->em->persist($c1);
        $this->em->persist($c2);
        $this->em->persist($c3);
        $this->em->persist($c4);

        // ── Importaciones (5) ───────────────────────────────────────────────
        $i1 = (new Importacion())
            ->setFechaDuaAlbaran(new \DateTime('2025-02-10'))
            ->setFechaFactura(new \DateTime('2025-02-08'))
            ->setProveedor($p1)
            ->setProducto('Ácido cítrico anhidro')
            ->setCantidad('10000.000')
            ->setImporteEur('12500.00')
            ->setAranceles('3.50')
            ->setCosteDespacho('850.00')
            ->setGastoImpKg('0.0935')
            ->setCosteKg('1.3435')
            ->setImporteUsd('13562.50')
            ->setTipoCambio('1.0850')
            ->setForwarderer('Kuehne+Nagel')
            ->setIncoterm('CIF')
            ->setDocumentacion(true);

        $i2 = (new Importacion())
            ->setFechaDuaAlbaran(new \DateTime('2025-04-05'))
            ->setFechaFactura(new \DateTime('2025-04-03'))
            ->setProveedor($p2)
            ->setProducto('Extracto de vainilla BIO')
            ->setCantidad('1000.000')
            ->setImporteEur('45000.00')
            ->setAranceles('0.00')
            ->setCosteDespacho('420.00')
            ->setGastoImpKg('0.4200')
            ->setCosteKg('45.4200')
            ->setImporteUsd('48915.00')
            ->setTipoCambio('1.0870')
            ->setForwarderer('DHL Global')
            ->setIncoterm('EXW')
            ->setDocumentacion(true)
            ->setObservaciones('Sin arancel por acuerdo UE-UK');

        $i3 = (new Importacion())
            ->setFechaDuaAlbaran(new \DateTime('2025-05-20'))
            ->setFechaFactura(new \DateTime('2025-05-18'))
            ->setProveedor($p3)
            ->setProducto('Lecitina de soja HALAL')
            ->setCantidad('5000.000')
            ->setImporteEur('19000.00')
            ->setAranceles('2.00')
            ->setCosteDespacho('640.00')
            ->setGastoImpKg('0.1528')
            ->setCosteKg('3.9528')
            ->setImporteUsd('20634.50')
            ->setTipoCambio('1.0860')
            ->setForwarderer('Geodis')
            ->setIncoterm('CFR')
            ->setDocumentacion(false);

        $i4 = (new Importacion())
            ->setFechaDuaAlbaran(new \DateTime('2025-08-12'))
            ->setFechaFactura(new \DateTime('2025-08-10'))
            ->setProveedor($p1)
            ->setProducto('Ácido cítrico anhidro')
            ->setCantidad('10000.000')
            ->setImporteEur('12500.00')
            ->setAranceles('3.50')
            ->setCosteDespacho('870.00')
            ->setGastoImpKg('0.0957')
            ->setCosteKg('1.3457')
            ->setImporteUsd('13625.00')
            ->setTipoCambio('1.0900')
            ->setForwarderer('Kuehne+Nagel')
            ->setIncoterm('CIF')
            ->setDocumentacion(true);

        $i5 = (new Importacion())
            ->setFechaDuaAlbaran(new \DateTime('2025-11-03'))
            ->setFechaFactura(new \DateTime('2025-11-01'))
            ->setProveedor($p4)
            ->setProducto('Proteína de guisante KOSHER')
            ->setCantidad('5000.000')
            ->setImporteEur('25750.00')
            ->setAranceles('1.50')
            ->setCosteDespacho('750.00')
            ->setGastoImpKg('0.2036')
            ->setCosteKg('5.3536')
            ->setImporteUsd('27808.00')
            ->setTipoCambio('1.0800')
            ->setForwarderer('Schenker')
            ->setIncoterm('CIP')
            ->setDocumentacion(true);

        $this->em->persist($i1);
        $this->em->persist($i2);
        $this->em->persist($i3);
        $this->em->persist($i4);
        $this->em->persist($i5);

        // ── Ofertas (5) ─────────────────────────────────────────────────────
        $o1 = (new Oferta())
            ->setFecha(new \DateTime('2025-12-01'))
            ->setProveedor($p1)
            ->setProducto('Ácido cítrico anhidro')
            ->setGrado('Food Grade')
            ->setCantidad('25000.000')
            ->setPrecio('1.1800')
            ->setMoneda('EUR')
            ->setIncoterm('CIF')
            ->setMuestra(false)
            ->setTipo('Contrato')
            ->setDocumentacion(true);

        $o2 = (new Oferta())
            ->setFecha(new \DateTime('2025-12-05'))
            ->setProveedor($p2)
            ->setProducto('Extracto de vainilla BIO')
            ->setGrado('Feed Grade')
            ->setCantidad('2000.000')
            ->setPrecio('43.5000')
            ->setMoneda('EUR')
            ->setIncoterm('EXW')
            ->setMuestra(true)
            ->setTipo('Pedido')
            ->setDocumentacion(true)
            ->setObservaciones('Precio rebajado por volumen');

        $o3 = (new Oferta())
            ->setFecha(new \DateTime('2026-01-10'))
            ->setProveedor($p3)
            ->setProducto('Lecitina de soja HALAL')
            ->setGrado('Food Grade')
            ->setCantidad('10000.000')
            ->setPrecio('3.6500')
            ->setMoneda('EUR')
            ->setIncoterm('CFR')
            ->setMuestra(false)
            ->setTipo('Contrato')
            ->setDocumentacion(false);

        $o4 = (new Oferta())
            ->setFecha(new \DateTime('2026-01-20'))
            ->setProveedor($p4)
            ->setProducto('Proteína de guisante KOSHER')
            ->setGrado('Food Grade')
            ->setCantidad('8000.000')
            ->setPrecio('5.0000')
            ->setMoneda('USD')
            ->setIncoterm('CIP')
            ->setMuestra(false)
            ->setTipo('Pedido')
            ->setDocumentacion(true);

        $o5 = (new Oferta())
            ->setFecha(new \DateTime('2026-02-14'))
            ->setProveedor($p2)
            ->setProducto('Glucosa en polvo BIO')
            ->setGrado('Reach')
            ->setCantidad('5000.000')
            ->setPrecio('2.2000')
            ->setMoneda('EUR')
            ->setIncoterm('EXW')
            ->setMuestra(true)
            ->setTipo('Contrato')
            ->setDocumentacion(true)
            ->setObservaciones('Nueva línea de producto');

        $this->em->persist($o1);
        $this->em->persist($o2);
        $this->em->persist($o3);
        $this->em->persist($o4);
        $this->em->persist($o5);

        // ── Muestras (5) ────────────────────────────────────────────────────
        $m1 = (new Muestra())
            ->setFecha(new \DateTime('2025-11-10'))
            ->setProveedor($p1)
            ->setEstado('Análisis')
            ->setIdLote('LOT-2025-QT-001')
            ->setProducto('Ácido cítrico anhidro')
            ->setGrado('FOOD')
            ->setDocumentacion(true)
            ->setUsuario($u2);

        $m2 = (new Muestra())
            ->setFecha(new \DateTime('2025-11-15'))
            ->setProveedor($p2)
            ->setEstado('Compra')
            ->setIdLote('LOT-2025-AS-007')
            ->setProducto('Extracto de vainilla BIO')
            ->setGrado('BIO')
            ->setDocumentacion(true)
            ->setUsuario($u1)
            ->setObservaciones('Aprobada para compra directa');

        $m3 = (new Muestra())
            ->setFecha(new \DateTime('2025-12-02'))
            ->setProveedor($p3)
            ->setEstado('Pendiente')
            ->setIdLote('LOT-2025-BD-003')
            ->setProducto('Lecitina de soja HALAL')
            ->setGrado('HALAL')
            ->setDocumentacion(false)
            ->setUsuario($u3)
            ->setObservaciones('Pendiente de análisis microbiológico');

        $m4 = (new Muestra())
            ->setFecha(new \DateTime('2026-01-08'))
            ->setProveedor($p4)
            ->setEstado('Análisis')
            ->setIdLote('LOT-2026-NF-001')
            ->setProducto('Proteína de guisante KOSHER')
            ->setGrado('KOSHER')
            ->setDocumentacion(true)
            ->setUsuario($u2);

        $m5 = (new Muestra())
            ->setFecha(new \DateTime('2026-02-20'))
            ->setProveedor($p2)
            ->setEstado('Pendiente')
            ->setIdLote('LOT-2026-AS-012')
            ->setProducto('Glucosa en polvo BIO')
            ->setGrado('BIO')
            ->setDocumentacion(false)
            ->setUsuario($u3)
            ->setObservaciones('Nueva referencia, primera muestra');

        $this->em->persist($m1);
        $this->em->persist($m2);
        $this->em->persist($m3);
        $this->em->persist($m4);
        $this->em->persist($m5);

        $this->em->flush();

        $io->success(sprintf(
            'Datos cargados: %d usuarios, %d proveedores, %d contratos, %d importaciones, %d ofertas, %d muestras.',
            3, 4, 4, 5, 5, 5
        ));

        return Command::SUCCESS;
    }
}
