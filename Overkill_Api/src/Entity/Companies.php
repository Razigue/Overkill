<?php

namespace App\Entity;

use App\Repository\CompaniesRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CompaniesRepository::class)]
class Companies
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 200, unique: true)]
    private ?string $name = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $website = null;

    /**
     * @var Collection<int, Offers>
     */
    #[ORM\OneToMany(targetEntity: Offers::class, mappedBy: 'company_id', orphanRemoval: true)]
    private Collection $tied_offers;

    public function __construct()
    {
        $this->tied_offers = new ArrayCollection();
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

    public function getWebsite(): ?string
    {
        return $this->website;
    }

    public function setWebsite(?string $website): static
    {
        $this->website = $website;

        return $this;
    }

    /**
     * @return Collection<int, Offers>
     */
    public function getTiedOffers(): Collection
    {
        return $this->tied_offers;
    }

    public function addTiedOffer(Offers $tiedOffer): static
    {
        if (!$this->tied_offers->contains($tiedOffer)) {
            $this->tied_offers->add($tiedOffer);
            $tiedOffer->setCompanyId($this);
        }

        return $this;
    }

    public function removeTiedOffer(Offers $tiedOffer): static
    {
        if ($this->tied_offers->removeElement($tiedOffer)) {
            // set the owning side to null (unless already changed)
            if ($tiedOffer->getCompanyId() === $this) {
                $tiedOffer->setCompanyId(null);
            }
        }

        return $this;
    }
}
