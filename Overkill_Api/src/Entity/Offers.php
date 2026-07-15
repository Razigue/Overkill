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
}
