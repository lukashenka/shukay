<?php

namespace Shukay\UserBundle\Controller;

use FOS\UserBundle\Form\Type\ChangePasswordFormType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Shukay\UserBundle\Entity\User;
use Symfony\Component\Finder\Exception\AccessDeniedException;
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
}
