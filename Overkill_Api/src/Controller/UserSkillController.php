<?php

namespace App\Controller;

use App\Entity\Skill;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/user/skills', name: 'api_user_skills_')]
class UserSkillController extends AbstractController
{
    #[Route('', name: 'list', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function list(): JsonResponse
    {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();

        $skills = array_map(fn(Skill $skill) => [
            'id' => $skill->getId(),
            'name' => $skill->getName(),
        ], $user->getSkills()->toArray());

        return $this->json($skills);
    }

    #[Route('', name: 'add', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function add(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $skillName = trim($data['name'] ?? '');

        if ($skillName === '') {
            return $this->json(['error' => 'Le nom de la compétence est requis.'], 400);
        }

        /** @var \App\Entity\User $user */
        $user = $this->getUser();

        // Vérifie si le skill existe déjà globalement, sinon on le crée
        $skillRepo = $em->getRepository(Skill::class);
        $skill = $skillRepo->findOneBy(['name' => $skillName]);

        if (!$skill) {
            $skill = new Skill();
            $skill->setName($skillName);
            $em->persist($skill);
        }

        // Associe le skill à l'utilisateur s'il ne l'a pas déjà
        if (!$user->getSkills()->contains($skill)) {
            $user->addSkill($skill);
            $em->flush();
        }

        return $this->json([
            'message' => 'Compétence ajoutée avec succès',
            'skill' => ['id' => $skill->getId(), 'name' => $skill->getName()]
        ], 201);
    }

    #[Route('/{id}', name: 'remove', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function remove(Skill $skill, EntityManagerInterface $em): JsonResponse
    {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();

        if ($user->getSkills()->contains($skill)) {
            $user->removeSkill($skill);
            $em->flush();
        }

        return $this->json(['message' => 'Compétence supprimée avec succès']);
    }
}
