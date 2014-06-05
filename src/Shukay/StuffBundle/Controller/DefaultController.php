<?php

namespace Shukay\StuffBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
	public function indexAction($name)
	{
		return $this->render('ShukayStuffBundle:Default:index.html.twig', array('name' => $name));
	}
}
