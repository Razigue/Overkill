<?php

namespace App\Entity;

use App\Repository\UserFavoritesRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UserFavoritesRepository::class)]
class UserFavorites
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?user $user_id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?offers $offer_id = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $created_at = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUserId(): ?users
    {
        return $this->user_id;
    }

    public function setUserId(?users $user_id): static
    {
        $this->user_id = $user_id;

        return $this;
    }

    public function getOfferId(): ?offers
    {
        return $this->offer_id;
    }

    public function setOfferId(?offers $offer_id): static
    {
        $this->offer_id = $offer_id;

        return $this;
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
