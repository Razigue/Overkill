<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

final class ContactController extends AbstractController
{
    #[Route('/api/contact', name: 'api_contact', methods: ['POST'])]
    public function contact(
        Request $request,
        MailerInterface $mailer,
        ValidatorInterface $validator,
        #[Autowire('%env(CONTACT_RECIPIENT)%')] string $recipient,
        #[Autowire('%env(CONTACT_SENDER)%')] string $sender,
    ): JsonResponse {
        try {
            $payload = $request->toArray();
        } catch (\Throwable) {
            return $this->json(['error' => 'La demande est invalide.'], Response::HTTP_BAD_REQUEST);
        }

        $form = [
            'name' => trim((string) ($payload['name'] ?? '')),
            'email' => trim((string) ($payload['email'] ?? '')),
            'subject' => trim((string) ($payload['subject'] ?? '')),
            'message' => trim((string) ($payload['message'] ?? '')),
        ];

        $violations = $validator->validate($form, new Assert\Collection([
            'name' => [new Assert\NotBlank(), new Assert\Length(max: 100)],
            'email' => [new Assert\NotBlank(), new Assert\Email(), new Assert\Length(max: 180)],
            'subject' => [new Assert\NotBlank(), new Assert\Length(max: 150)],
            'message' => [new Assert\NotBlank(), new Assert\Length(max: 5000)],
        ]));

        if (count($violations) > 0) {
            return $this->json(
                ['error' => 'Merci de vérifier les informations saisies.'],
                Response::HTTP_UNPROCESSABLE_ENTITY,
            );
        }

        $email = (new Email())
            ->from(new Address($sender, 'Overkill'))
            ->to($recipient)
            ->replyTo(new Address($form['email'], $form['name']))
            ->subject(sprintf('[Contact Overkill] %s', $form['subject']))
            ->text(sprintf(
                "Nouveau message depuis le site Overkill\n\nNom : %s\nEmail : %s\nSujet : %s\n\nMessage :\n%s",
                $form['name'],
                $form['email'],
                $form['subject'],
                $form['message'],
            ));

        try {
            $mailer->send($email);
        } catch (TransportExceptionInterface) {
            return $this->json(
                ['error' => "Le message n'a pas pu être envoyé. Réessayez dans quelques instants."],
                Response::HTTP_SERVICE_UNAVAILABLE,
            );
        }

        return $this->json(['message' => 'Votre message a bien été envoyé.'], Response::HTTP_CREATED);
    }
}
