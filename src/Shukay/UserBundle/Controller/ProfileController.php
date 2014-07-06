<?php

namespace Shukay\UserBundle\Controller;

use FOS\UserBundle\Form\Type\ChangePasswordFormType;
use Shukay\UserBundle\Entity\ProfileInformation;
use Shukay\UserBundle\Form\UserType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Shukay\UserBundle\Entity\User;
use Symfony\Component\Finder\Exception\AccessDeniedException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;


class ProfileController extends Controller
{
    public function indexAction($username)
    {

        if (!isset($username)) {

            if ($this->get("security.context")->isGranted("IS_AUTHENTICATED_FULLY")) {
                $username = $this->getUser()->getUsername();
            } else {
                throw new AccessDeniedException("You must log in");
            }
        }

        $em = $this->getDoctrine()->getManager();
        $user = $em->getRepository("ShukayUserBundle:User")->findOneByUsername($username);

        if (!($user instanceof User)) {
            throw new NotFoundHttpException('User doesnt exist');
        }


        return $this->render('ShukayUserBundle:Profile:profile.html.twig',
            array(
                'user' => $user
            )
        );
    }

    public function changeEmailAction()
    {
        $user = $this->get('security.context')->getToken()->getUser();
        if (!is_object($user) || !$user instanceof User) {
            throw new AccessDeniedException('This user does not have access to this section.');
        }

        $form = $this->container->get('fos_user.profile.form');
        $formHandler = $this->container->get('fos_user.profile.form.handler');

        $process = $formHandler->process($user);
        if ($process) {
            $this->get("session")->getFlashBag()->set('fos_user_success', 'profile.flash.updated');
        }

        return $this->render(
            '@ShukayUser/Profile/Setting/change.email.html.twig',
            array(
                'form' => $form->createView()
            )
        );
    }

    public function changeProfileAction()
    {

        $user = $this->getUser();
        $imageDir = $this->get("dropzone")->getWebPath("avatars", $user->getUsername());

        if (!is_object($user) || !$user instanceof User) {
            throw new AccessDeniedException('This user does not have access to this section.');
        }

        $form = $this->createEditForm($user);

        return $this->render("@ShukayUser/Profile/Setting/change.profile.html.twig",
            array(
                "form" => $form->createView()
            )
        );

    }

    private function createEditForm(User $entity)
    {
        $username = $entity->getUsername();
        $imageDir = $this->get("dropzone")->getWebPath("avatars", $username);

        $form = $this->createForm(new UserType($imageDir), $entity, array(
            'action' => $this->generateUrl('update_profile', array('id' => $entity->getId())),
            'method' => 'PUT',
        ));

        $form->add('submit', 'submit', array('label' => 'Update'));

        return $form;
    }

    public function updateProfileAction(Request $request, $id)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = $em->getRepository('ShukayUserBundle:User')->findOneById($id);

        if (!$entity instanceof User) {
            throw new NotFoundHttpException("User has no found");
        }


        if(!$entity->getProfileInformation() instanceof ProfileInformation)
        {
            throw new NotFoundHttpException("Profile Information Not found");
        }

        $oldImage = $entity->getProfileInformation()->getAvatar();


        $editForm = $this->createEditForm($entity);
        $editForm->submit($request);

        $user = $editForm->getData();

        if ($editForm->isValid()) {

            //if image not updated
            if ($oldImage !== $user->getProfileInformation()->getAvatar()) {
                $dropzone = $this->get("dropzone");
                $dropzone->setFolder("avatars");
                $dropzone->setUserName($this->get("security.context")->getToken()->getUsername());
                $dropzone->saveImage($user->getProfileInformation()->getAvatar());
            }

            $em->persist($user);
            $em->flush();
        }

        return $this->render("@ShukayUser/Profile/Setting/change.profile.html.twig",
            array(
                "form" => $editForm->createView()
            )
        );


    }
}
