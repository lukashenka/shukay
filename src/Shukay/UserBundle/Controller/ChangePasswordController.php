<?php

namespace Shukay\UserBundle\Controller;


use FOS\UserBundle\Controller\ChangePasswordController as BaseController;
use Symfony\Component\HttpFoundation\File\Exception\AccessDeniedException;
use Shukay\UserBundle\Entity\User;

class ChangePasswordController extends BaseController
{
    public function changePasswordAction()
    {
        $user = $this->container->get('security.context')->getToken()->getUser();
        if (!is_object($user) || !$user instanceof User) {
            throw new AccessDeniedException('This user does not have access to this section.');
        }

        $form = $this->container->get('fos_user.change_password.form');
        $formHandler = $this->container->get('fos_user.change_password.form.handler');

        $process = $formHandler->process($user);

        if ($process) {
            $this->setFlash('fos_user_success', 'change_password.flash.success');
        }

        return $this->container->get("templating")->renderResponse(
            '@ShukayUser/Profile/Setting/change.password.html.twig',
            array(
                'user' => $user,
                'changePasswordForm' => $form->createView()
            )
        );
    }


}
