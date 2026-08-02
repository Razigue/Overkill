<?php

/**
 * This file intercepts the JSON sent by the frontend to
 * secure the values and validate data strictly.
 **/

namespace App\Dto;

// Correction ici : Ajout du 's' à Constraints
use Symfony\Component\Validator\Constraints as Assert;

class RegistrationInput
{
    #[Assert\NotBlank(message: "L'adresse email est obligatoire.")]
    #[Assert\Email(message: "L'adresse email n'est pas valide.")]
    public ?string $email = null;

    #[Assert\NotBlank(message: "Le mot de passe est obligatoire.")]
    #[Assert\Length(
        min: 8,
        minMessage: "Le mot de passe doit comporter au moins {{ limit }} caractères."
    )]
    public ?string $password = null;

    #[Assert\NotBlank(message: "Le prénom est obligatoire.")]
    #[Assert\Length(max: 80, maxMessage: "Le prénom ne peut pas dépasser 80 caractères.")]
    public ?string $firstName = null; // Optionnel mais recommandé : camelCase

    #[Assert\NotBlank(message: "Le nom est obligatoire.")]
    #[Assert\Length(max: 80, maxMessage: "Le nom ne peut pas dépasser 80 caractères.")]
    public ?string $lastName = null;  // Optionnel mais recommandé : camelCase
}
