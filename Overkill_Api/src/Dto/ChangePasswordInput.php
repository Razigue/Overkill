<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

final class ChangePasswordInput
{
    #[Assert\NotBlank(message: 'Le mot de passe actuel est obligatoire.')]
    public ?string $currentPassword = null;

    #[Assert\NotBlank(message: 'Le nouveau mot de passe est obligatoire.')]
    #[Assert\Length(
        min: 8,
        max: 4096,
        minMessage: 'Le nouveau mot de passe doit comporter au moins {{ limit }} caractères.',
        maxMessage: 'Le nouveau mot de passe est trop long.'
    )]
    public ?string $newPassword = null;
}
