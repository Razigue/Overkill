<?php

namespace App\Entity;

use App\Repository\CategoriesRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CategoriesRepository::class)]
class Categories
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private ?string $name = null;

    /**
     * @var Collection<int, Offers>
     */
    #[ORM\ManyToMany(targetEntity: Offers::class, mappedBy: 'category_id')]
    private Collection $tied_categories;

    public function __construct()
    {
        $this->tied_categories = new ArrayCollection();
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

    /**
     * @return Collection<int, Offers>
     */
    public function getTiedCategories(): Collection
    {
        return $this->tied_categories;
    }

    public function addTiedCategory(Offers $tiedCategory): static
    {
        if (!$this->tied_categories->contains($tiedCategory)) {
            $this->tied_categories->add($tiedCategory);
            $tiedCategory->addCategoryId($this);
        }

        return $this;
    }

    public function removeTiedCategory(Offers $tiedCategory): static
    {
        if ($this->tied_categories->removeElement($tiedCategory)) {
            $tiedCategory->removeCategoryId($this);
        }

        return $this;
    }
}
