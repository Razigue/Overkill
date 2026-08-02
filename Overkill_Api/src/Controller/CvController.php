<?php

namespace App\Controller;

use App\Entity\Cv;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\String\Slugger\SluggerInterface;

#[Route('/api/cvs', name: 'api_cvs_')]
class CvController extends AbstractController
{
    /**
     * Route 1 : Récupérer la liste des CVs de l'utilisateur
     */
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(#[CurrentUser] ?User $user): JsonResponse
    {
        // 1. Vérification de l'authentification
        if (!$user) {
            return $this->json(['error' => 'Non autorisé'], Response::HTTP_UNAUTHORIZED);
        }

        // 2. Formatage des données des CVs sous forme de tableau JSON
        $cvsData = [];
        foreach ($user->getCvs() as $cv) {
            $cvsData[] = [
                'id' => $cv->getId(),
                'originalName' => $cv->getOriginalName(),
                'filePath' => '/uploads/cvs/' . $cv->getFilePath(),
                'uploadedAt' => $cv->getUploadedAt()->format('d/m/Y'),
            ];
        }

        return $this->json($cvsData);
    }

    /**
     * Route 2 : Réceptionner et enregistrer un nouveau CV
     */
    #[Route('/upload', name: 'upload', methods: ['POST'])]
    public function upload(
        Request $request,
        EntityManagerInterface $em,
        SluggerInterface $slugger,
        #[CurrentUser] ?User $user
    ): JsonResponse {
        // 1. Vérification de l'authentification
        if (!$user) {
            return $this->json(['error' => 'Non autorisé'], Response::HTTP_UNAUTHORIZED);
        }

        /** @var UploadedFile $file */
        $file = $request->files->get('file');

        // 2. Vérification de la présence du fichier
        if (!$file) {
            return $this->json(['error' => 'Aucun fichier fourni'], Response::HTTP_BAD_REQUEST);
        }

        // 3. Contrôle de sécurité sur l'extension
        $allowedExtensions = ['pdf', 'doc', 'docx'];
        $extension = strtolower($file->getClientOriginalExtension());
        if (!in_array($extension, $allowedExtensions)) {
            return $this->json(['error' => 'Format non autorisé (PDF, DOC, DOCX uniquement)'], Response::HTTP_BAD_REQUEST);
        }

        // 4. Génération d'un nom de fichier unique et sécurisé
        $originalFilename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $safeFilename = $slugger->slug($originalFilename);
        $newFilename = $safeFilename . '-' . uniqid() . '.' . $file->guessExtension();

        // 5. Déplacement du fichier physique vers le stockage local
        try {
            $file->move(
                $this->getParameter('cvs_directory'),
                $newFilename
            );
        } catch (FileException $e) {
            return $this->json(['error' => 'Erreur lors de la sauvegarde du fichier'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        // 6. Enregistrement des informations en BDD
        $cv = new Cv();
        $cv->setOriginalName($file->getClientOriginalName());
        $cv->setFilePath($newFilename);
        $cv->setUser($user);

        $em->persist($cv);
        $em->flush();

        // 7. Envoi de la réponse de succès avec les données du CV créé
        return $this->json([
            'message' => 'CV envoyé avec succès !',
            'cv' => [
                'id' => $cv->getId(),
                'originalName' => $cv->getOriginalName(),
                'filePath' => '/uploads/cvs/' . $cv->getFilePath(),
                'uploadedAt' => $cv->getUploadedAt()->format('d/m/Y'),
            ]
        ], Response::HTTP_CREATED);
    }

    /**
     * Route 3 : Supprimer un CV appartenant à l'utilisateur connecté
     */
    #[Route('/{id}', name: 'delete', methods: ['DELETE'], requirements: ['id' => '\\d+'])]
    public function delete(
        int $id,
        EntityManagerInterface $em,
        Filesystem $filesystem,
        #[CurrentUser] ?User $user
    ): Response {
        if (!$user) {
            return $this->json(['error' => 'Non autorisé'], Response::HTTP_UNAUTHORIZED);
        }

        $cv = $em->getRepository(Cv::class)->find($id);
        if (!$cv) {
            return $this->json(['error' => 'CV introuvable'], Response::HTTP_NOT_FOUND);
        }

        if ($cv->getUser() !== $user) {
            return $this->json(['error' => 'Accès refusé'], Response::HTTP_FORBIDDEN);
        }

        $storedFilename = basename((string) $cv->getFilePath());
        $storedPath = rtrim((string) $this->getParameter('cvs_directory'), DIRECTORY_SEPARATOR)
            . DIRECTORY_SEPARATOR
            . $storedFilename;

        try {
            if ($filesystem->exists($storedPath)) {
                $filesystem->remove($storedPath);
            }
        } catch (\Throwable) {
            return $this->json(
                ['error' => 'Impossible de supprimer le fichier du CV'],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }

        $em->remove($cv);
        $em->flush();

        return new Response(null, Response::HTTP_NO_CONTENT);
    }

}
