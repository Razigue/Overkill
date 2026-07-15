<?php

namespace App\Entity;

use App\Repository\OffersRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: OffersRepository::class)]
class Offers
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $title = null;

    #[ORM\Column(length: 255)]
    private ?string $kind = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $description = null;

    #[ORM\ManyToOne(inversedBy: 'tied_offers')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Companies $company_id = null;

    #[ORM\Column(length: 120, nullable: true)]
    private ?string $city = null;

    #[ORM\Column(length: 2, nullable: true)]
    private ?string $country = null;

    #[ORM\Column]
    private ?bool $is_remote = null;

    #[ORM\Column(type: Types::INTEGER, nullable: true)]
    private ?int $latitude = null;

    #[ORM\Column(type: Types::INTEGER, nullable: true)]
    private ?int $longitude = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $published_at = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTime $starts_at = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTime $ends_at = null;

    #[ORM\Column(type: Types::INTEGER, nullable: true)]
    private ?int $salary_min = null;

    #[ORM\Column(type: Types::INTEGER, nullable: true)]
    private ?int $salary_max = null;

    #[ORM\Column(length: 3, nullable: true)]
    private ?string $salary_currency = null;

    #[ORM\Column(length: 10)]
    private ?string $contract = null;

    /**
     * @var Collection<int, Categories>
     */
    #[ORM\ManyToMany(targetEntity: Categories::class, inversedBy: 'tied_categories')]
    private Collection $category_id;

    #[ORM\Column(type: Types::SIMPLE_ARRAY)]
    private array $extracted_skills = [];

    #[ORM\ManyToOne(inversedBy: 'tied_sources')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Sources $source_id = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $external_url = null;

    #[ORM\Column]
    private ?bool $is_duplicate = null;

    #[ORM\Column(type: Types::INTEGER)]
    private ?int $views_count = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $created_at = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $updated_at = null;

    public function __construct()
    {
        $this->category_id = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    #[Groups('offers:read')]
    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }
    #[Groups('offers:read')]
    public function getKind(): ?string
    {
        return $this->kind;
    }

    public function setKind(string $kind): static
    {
        $this->kind = $kind;

        return $this;
    }
    #[Groups('offers:read')]
    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }
    #[Groups('offers:read')]
    public function getCompanyId(): ?Companies
    {
        return $this->company_id;
    }

    public function setCompanyId(?Companies $company_id): static
    {
        $this->company_id = $company_id;

        return $this;
    }
    #[Groups('offers:read')]
    public function getCity(): ?string
    {
        return $this->city;
    }

    public function setCity(?string $city): static
    {
        $this->city = $city;

        return $this;
    }
    #[Groups('offers:read')]
    public function getCountry(): ?string
    {
        return $this->country;
    }

    public function setCountry(?string $country): static
    {
        $this->country = $country;

        return $this;
    }
    #[Groups('offers:read')]
    public function isRemote(): ?bool
    {
        return $this->is_remote;
    }

    public function setIsRemote(bool $is_remote): static
    {
        $this->is_remote = $is_remote;

        return $this;
    }
    #[Groups('offers:read')]
    public function getLatitude(): ?int
    {
        return $this->latitude;
    }

    public function setLatitude(?int $latitude): static
    {
        $this->latitude = $latitude;

        return $this;
    }
    #[Groups('offers:read')]
    public function getLongitude(): ?int
    {
        return $this->longitude;
    }

    public function setLongitude(?int $longitude): static
    {
        $this->longitude = $longitude;

        return $this;
    }
    #[Groups('offers:read')]
    public function getPublishedAt(): ?\DateTimeImmutable
    {
        return $this->published_at;
    }

    public function setPublishedAt(\DateTimeImmutable $published_at): static
    {
        $this->published_at = $published_at;

        return $this;
    }
    #[Groups('offers:read')]
    public function getStartsAt(): ?\DateTime
    {
        return $this->starts_at;
    }

    public function setStartsAt(\DateTime $starts_at): static
    {
        $this->starts_at = $starts_at;

        return $this;
    }
    #[Groups('offers:read')]
    public function getEndsAt(): ?\DateTime
    {
        return $this->ends_at;
    }

    public function setEndsAt(?\DateTime $ends_at): static
    {
        $this->ends_at = $ends_at;

        return $this;
    }
    #[Groups('offers:read')]
    public function getSalaryMin(): ?int
    {
        return $this->salary_min;
    }

    public function setSalaryMin(?int $salary_min): static
    {
        $this->salary_min = $salary_min;

        return $this;
    }
    #[Groups('offers:read')]
    public function getSalaryMax(): ?int
    {
        return $this->salary_max;
    }

    public function setSalaryMax(?int $salary_max): static
    {
        $this->salary_max = $salary_max;

        return $this;
    }
    #[Groups('offers:read')]
    public function getSalaryCurrency(): ?string
    {
        return $this->salary_currency;
    }

    public function setSalaryCurrency(?string $salary_currency): static
    {
        $this->salary_currency = $salary_currency;

        return $this;
    }
    #[Groups('offers:read')]
    public function getContract(): ?string
    {
        return $this->contract;
    }

    public function setContract(string $contract): static
    {
        $this->contract = $contract;

        return $this;
    }

    /**
     * @return Collection<int, Categories>
     */
    #[Groups('offers:read')]
    public function getCategoryId(): Collection
    {
        return $this->category_id;
    }

    public function addCategoryId(Categories $categoryId): static
    {
        if (!$this->category_id->contains($categoryId)) {
            $this->category_id->add($categoryId);
        }

        return $this;
    }

    public function removeCategoryId(Categories $categoryId): static
    {
        $this->category_id->removeElement($categoryId);

        return $this;
    }
    #[Groups('offers:read')]
    public function getExtractedSkills(): array
    {
        return $this->extracted_skills;
    }

    public function setExtractedSkills(array $extracted_skills): static
    {
        $this->extracted_skills = $extracted_skills;

        return $this;
    }
    #[Groups('offers:read')]
    public function getSourceId(): ?Sources
    {
        return $this->source_id;
    }

    public function setSourceId(?Sources $source_id): static
    {
        $this->source_id = $source_id;

        return $this;
    }
    #[Groups('offers:read')]
    public function getExternalUrl(): ?string
    {
        return $this->external_url;
    }

    public function setExternalUrl(string $external_url): static
    {
        $this->external_url = $external_url;

        return $this;
    }
    #[Groups('offers:read')]
    public function isDuplicate(): ?bool
    {
        return $this->is_duplicate;
    }

    public function setIsDuplicate(bool $is_duplicate): static
    {
        $this->is_duplicate = $is_duplicate;

        return $this;
    }
    public function getViewsCount(): ?int
    {
        return $this->views_count;
    }

    public function setViewsCount(int $views_count): static
    {
        $this->views_count = $views_count;

        return $this;
    }
    #[Groups('offers:read')]
    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->created_at;
    }

    public function setCreatedAt(\DateTimeImmutable $created_at): static
    {
        $this->created_at = $created_at;

        return $this;
    }
    #[Groups('offers:read')]
    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updated_at;
    }

    public function setUpdatedAt(\DateTimeImmutable $updated_at): static
    {
        $this->updated_at = $updated_at;

        return $this;
    }
}
