<?php

namespace Shukay\MainBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
	public function indexAction()
	{
		return $this->render('ShukayMainBundle:Default:index.html.twig');
	}
}
