<?php
/**
 * Created by PhpStorm.
 * User: karachungen
 * Date: 6/22/14
 * Time: 3:34 PM
 */

namespace Shukay\MainBundle\Service;


use Symfony\Component\DependencyInjection\Container;

class PathService
{

    private $container;

    public function __construct(Container $container)
    {
        $this->container = $container;
    }

    public function getRootDir()
    {
        return $this->container->get("kernel")->getRootDir();
    }

    public function getWebDir()
    {

        return $this->getRootDir() . "/../web/";

    }

    public function getWebUploadsDir()
    {
        return "/uploads/";
    }

    public function getUploadsDir()
    {
        return $this->getWebDir() . "uploads/";
    }

} 