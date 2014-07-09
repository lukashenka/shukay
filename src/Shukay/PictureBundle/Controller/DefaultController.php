<?php

namespace Shukay\PictureBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function indexAction($name)
    {
        return $this->render('ShukayPictureBundle:Default:index.html.twig', array('name' => $name));
    }
}
