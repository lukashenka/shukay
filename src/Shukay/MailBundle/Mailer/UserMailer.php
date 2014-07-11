<?php
/**
 * Created by PhpStorm.
 * User: karachungen
 * Date: 7/11/14
 * Time: 12:44 PM
 */

namespace Shukay\MailBundle\Mailer;

use FOS\UserBundle\Mailer\Mailer;
use FOS\UserBundle\Model\UserInterface;


class UserMailer extends Mailer
{

	public function sendConfirmationEmailMessage(UserInterface $user)
	{

		$url = $this->router->generate('registration_confirm', array('token' => $user->getConfirmationToken()), true);
		$rendered = $this->templating->render("@ShukayUser/Security/checkEmail.html.twig", array(
			'user' => $user,
			'confirmationUrl' => $url
		));
		$this->sendEmailMessage($rendered, $this->parameters['from_email']['confirmation'], $user->getEmail());
	}


}