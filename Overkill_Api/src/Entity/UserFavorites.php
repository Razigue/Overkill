<?php

namespace App\Entity;

use App\Entity\Offers;
use App\Entity\User;
use App\Repository\UserFavoritesRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UserFavoritesRepository::class)]
class UserFavorites
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user_id = null;

    #[ORM\ManyToOne(targetEntity: Offers::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?Offers $offer_id = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $created_at = null;

    public function __construct()
    {
        $this->created_at = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUserId(): ?User
    {
        return $this->user_id;
    }

    public function setUserId(?User $user_id): static
    {
        $this->user_id = $user_id;

        return $this;
    }

    // Alias pour compatibilité si votre code/test appelle setUser()
    public function setUser(?User $user): static
    {
        return $this->setUserId($user);
    }

    public function getUser(): ?User
    {
        return $this->getUserId();
    }

    public function getOfferId(): ?Offers
    {
        return $this->offer_id;
    }

    public function setOfferId(?Offers $offer_id): static
    {
        $this->offer_id = $offer_id;

        return $this;
    }

    // Alias pour compatibilité si votre code/test appelle setOffer()
    public function setOffer(?Offers $offer): static
    {
        return $this->setOfferId($offer);
    }

    public function getOffer(): ?Offers
    {
        return $this->getOfferId();
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->created_at;
    }

    public function setCreatedAt(\DateTimeImmutable $created_at): static
    {
        $this->created_at = $created_at;

        return $this;
    }
}