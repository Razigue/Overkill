<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

final class UpdateProfileInput
{
    #[Assert\NotBlank(message: 'Le prénom est obligatoire.')]
    #[Assert\Length(max: 80, maxMessage: 'Le prénom ne peut pas dépasser {{ limit }} caractères.')]
    public ?string $firstName = null;

    #[Assert\NotBlank(message: 'Le nom est obligatoire.')]
    #[Assert\Length(max: 80, maxMessage: 'Le nom ne peut pas dépasser {{ limit }} caractères.')]
    public ?string $lastName = null;

    #[Assert\NotBlank(message: 'L’adresse e-mail est obligatoire.')]
    #[Assert\Email(message: 'L’adresse e-mail n’est pas valide.')]
    #[Assert\Length(max: 180, maxMessage: 'L’adresse e-mail ne peut pas dépasser {{ limit }} caractères.')]
    public ?string $email = null;

    #[Assert\NotBlank(message: 'Le mot de passe actuel est obligatoire.')]
    public ?string $currentPassword = null;
}
