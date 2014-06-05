<?php

namespace Shukay\UserBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
	public function indexAction($name)
	{
		return $this->render('ShukayUserBundle:Default:index.html.twig', array('name' => $name));
	}
}
