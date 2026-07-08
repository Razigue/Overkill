<?php

namespace App\Entity;

use App\Repository\SourcesRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: SourcesRepository::class)]
class Sources
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private ?string $name = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $base_url = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $fetch_method = null;

    /**
     * @var Collection<int, Offers>
     */
    #[ORM\OneToMany(targetEntity: Offers::class, mappedBy: 'source_id', orphanRemoval: true)]
    private Collection $tied_sources;

    public function __construct()
    {
        $this->tied_sources = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getBaseUrl(): ?string
    {
        return $this->base_url;
    }

    public function setBaseUrl(string $base_url): static
    {
        $this->base_url = $base_url;

        return $this;
    }

    public function getFetchMethod(): ?string
    {
        return $this->fetch_method;
    }

    public function setFetchMethod(?string $fetch_method): static
    {
        $this->fetch_method = $fetch_method;

        return $this;
    }

    /**
     * @return Collection<int, Offers>
     */
    public function getTiedSources(): Collection
    {
        return $this->tied_sources;
    }

    public function addTiedSource(Offers $tiedSource): static
    {
        if (!$this->tied_sources->contains($tiedSource)) {
            $this->tied_sources->add($tiedSource);
            $tiedSource->setSourceId($this);
        }

        return $this;
    }

    public function removeTiedSource(Offers $tiedSource): static
    {
        if ($this->tied_sources->removeElement($tiedSource)) {
            // set the owning side to null (unless already changed)
            if ($tiedSource->getSourceId() === $this) {
                $tiedSource->setSourceId(null);
            }
        }

        return $this;
    }
}
