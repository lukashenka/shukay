<?php
/**
 * Created by PhpStorm.
 * User: karachungen
 * Date: 6/22/14
 * Time: 1:14 AM
 */

namespace Shukay\StuffBundle\Listener;

use Symfony\Component\DependencyInjection\Container;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;
use Oneup\UploaderBundle\Uploader\File\FilesystemFile;
use Oneup\UploaderBundle\Event\PreUploadEvent;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
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

    public function onPreUpload(PreUploadEvent $event)
    {


        if ($this->user->isGranted('IS_AUTHENTICATED_FULLY')) {

            $userName = $this->user->getToken()->getUsername();
            $uploadPath = $this->container->get("path")->getUploadsDir() . $userName;

            $fs = new Filesystem();
            if (!$fs->exists($uploadPath)) {

                $fs->mkdir($uploadPath);

            }
            $file = $event->getFile();
            if ($file instanceof FilesystemFile) {

                $file->move($uploadPath);
            }
        } else {


        }
    }
}