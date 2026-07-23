<?php

/**
 * DTO d'entrée pour la création d'une offre via POST /api/offers.
 * Appelé par notre collecteur (scraper / API externe), pas par l'utilisateur final.
 * Valide strictement le JSON avant tout persist en base.
 **/

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class OfferInput
{

    #[Assert\NotBlank(message: "Le titre est obligatoire.")]
    #[Assert\Length(max: 255, maxMessage: "Le titre ne peut pas dépasser {{ limit }} caractères.")]
    public ?string $title = null;

    #[Assert\NotBlank(message: "Le type d'offre est obligatoire.")]
    #[Assert\Choice(choices: ['job', 'internship', 'apprenticeship'], message: "Type d'offre invalide.")]
    public ?string $kind = null;


    public ?string $description = null;


    #[Assert\NotBlank(message: "L'id de l'entreprise est obligatoire.")]
    #[Assert\PositiveOrZero]
    public ?int $company_id = null;


    #[Assert\Length(max: 120)]
    public ?string $city = null;

    #[Assert\Length(exactly: 2, exactMessage: "Le pays doit être un code ISO à 2 lettres.")]
    public ?string $country = null;

    #[Assert\Choice(choices: ['onsite', 'hybrid', 'full_remote'])]
    public ?string $isRemote = null;


    #[Assert\Range(min: -90, max: 90)]
    public ?float $latitude = null;

    #[Assert\Range(min: -180, max: 180)]
    public ?float $longitude = null;


    #[Assert\NotBlank(message: "La date de publication est obligatoire.")]
    public ?string $publishedAt = null;

    #[Assert\NotBlank(message: "La date de début est obligatoire.")]
    public ?string $startsAt = null;

    public ?string $endsAt = null;


    #[Assert\PositiveOrZero]
    public ?int $salaryMin = null;

    #[Assert\PositiveOrZero]
    #[Assert\Expression(
        "this.salaryMin === null or this.salaryMax === null or this.salaryMax >= this.salaryMin",
        message: "Le salaire max doit être supérieur ou égal au salaire min."
    )]
    public ?int $salaryMax = null;


    #[Assert\Length(exactly: 3, exactMessage: "La devise doit être un code ISO à 3 lettres.")]
    public ?string $salaryCurrency = null;

    #[Assert\NotBlank(message: "Le type de contrat est obligatoire.")]
    #[Assert\Choice(
        choices: ['CDI', 'CDD', 'stage', 'alternance', 'freelance'],
        message: "Type de contrat invalide."
    )]
    public ?string $contract = null;


    #[Assert\All([new Assert\Type('int'), new Assert\PositiveOrZero])]
    public array $category_id = [];


    #[Assert\All([new Assert\Type('string')])]
    public array $extractedSkills = [];


    #[Assert\NotBlank(message: "La source est obligatoire.")]
    #[Assert\PositiveOrZero]
    public ?int $source_id = null;

    #[Assert\NotBlank(message: "L'URL de l'offre est obligatoire.")]
    #[Assert\Url(message: "L'URL de l'offre n'est pas valide.")]
    public ?string $externalUrl = null;
}
