<?php

namespace App\Dto;

final class EmailClassificationResult
{
    public function __construct(
        public readonly string $entityType,
        public readonly ?int $entityId,
        public readonly string $urgency,
        public readonly ?string $categoriaNombre,
        public readonly float $confidence,
        public readonly string $source,
        public readonly string $reason,
    ) {
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'entityType' => $this->entityType,
            'entityId' => $this->entityId,
            'urgency' => $this->urgency,
            'categoriaNombre' => $this->categoriaNombre,
            'confidence' => $this->confidence,
            'source' => $this->source,
            'reason' => $this->reason,
        ];
    }
}
