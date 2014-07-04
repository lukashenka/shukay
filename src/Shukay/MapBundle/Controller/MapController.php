<?php

namespace Shukay\MapBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;


class MapController extends Controller
{
	public function indexAction()
	{

		$em = $this->getDoctrine()->getManager();

		$allStuff = $em->getRepository("ShukayStuffBundle:Stuff")->findAll();

		return $this->render('ShukayMapBundle:Default:index.html.twig', array("allStuff" => $allStuff));
	}
}
