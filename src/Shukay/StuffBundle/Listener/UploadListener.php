<?php
/**
 * Created by PhpStorm.
 * User: karachungen
 * Date: 6/22/14
 * Time: 1:14 AM
 */

namespace Shukay\StuffBundle\Listener;

use Oneup\UploaderBundle\Event\PostUploadEvent;
use Oneup\UploaderBundle\Event\PreUploadEvent;
use Symfony\Component\DependencyInjection\Container;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;
use Symfony\Component\Security\Core\SecurityContext;

class UploadListener
{


    private $user;
    private $container;

    public function __construct(Container $container, SecurityContext $user)
    {

        $this->container = $container;
        $this->user = $user;
    }

    public function onPostUpload(PostUploadEvent $event)
    {

        $response = $event->getResponse();
//        $userName = $this->container->get("security.context")->getToken()->getUsername();
//
//        $uploadDir = $this->container->get("path")->getUploadsDir()."stuff/";
//
//        $uploadedFile = $uploadDir.$userName."/temp/".$response["filename"];
//
//        $file = new File($uploadedFile);
//        $file->move($uploadDir.$response["filename"]);


    }

    public function onPreUpload(PreUploadEvent $event)
    {


    }
}