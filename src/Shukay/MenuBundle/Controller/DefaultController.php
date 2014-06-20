<?php

namespace Shukay\MenuBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
	public function indexAction($name)
	{
		return $this->render('ShukayMenuBundle:Default:index.html.twig', array('name' => $name));
	}
}
