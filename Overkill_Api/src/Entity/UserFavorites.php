<?php

namespace App\Entity;

use App\Repository\UserFavoritesRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

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

    #[Groups('favorites:read')]
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUserId(): ?user
    {
        return $this->user_id;
    }

    public function setUserId(?user $user_id): static
    {
        $this->user_id = $user_id;

        return $this;
    }


    #[Groups('favorites:read')]
    public function getOfferId(): ?offers
    {
        return $this->offer_id;
    }

    public function setOfferId(?offers $offer_id): static
    {
        $this->offer_id = $offer_id;

        return $this;
    }

    #[Groups('favorites:read')]
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