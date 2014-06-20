<?php

namespace Shukay\MapBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;


class MapController extends Controller
{
	public function indexAction()
	{
		return $this->render('ShukayMapBundle:Default:index.html.twig');
	}
}
