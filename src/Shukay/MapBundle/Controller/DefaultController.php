<?php

namespace Shukay\MapBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Shukay\MapBundle\Form\LocationType;
use Shukay\MapBundle\Entity\Location;

class DefaultController extends Controller
{
	public function indexAction()
	{

		$location = $this->getDoctrine()->getManager()->getRepository("ShukayMapBundle:Location")->findOneById(1);

		$form = $this->createForm(new LocationType());
		$form->setData($location);

		return $this->render('ShukayMapBundle:Default:index.html.twig', array('form' => $form->createView()));
	}
}
