<?php
/**
 * Created by PhpStorm.
 * User: karachungen
 * Date: 6/22/14
 * Time: 4:39 PM
 */

namespace Shukay\DropzoneBundle\Controller;

use Oneup\UploaderBundle\Controller\DropzoneController as BaseController;
use Oneup\UploaderBundle\Uploader\File\FileInterface;
use Oneup\UploaderBundle\Uploader\File\FilesystemFile;
use Oneup\UploaderBundle\Uploader\Response\EmptyResponse;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\Exception\UploadException;

class DropzoneController extends BaseController
{

    public function upload()
    {
        $folder = $this->config["storage"]["directory"];
        $folder = substr(strrchr($folder, "/"), 1);

        $request = $this->container->get('request');
        $response = new EmptyResponse();
        $files = $this->getFiles($request->files);
        $user = $this->container->get("security.context");

        foreach ($files as $file) {
            try {

                if (!($file instanceof FileInterface)) {
                    $file = new FilesystemFile($file);
                }

                if ($user->isGranted('IS_AUTHENTICATED_FULLY')) {

                    $userName = $user->getToken()->getUsername();

	                $dropzone = $this->container->get("dropzone");
	                $dropzone->setUserName($userName);
	                $dropzone->setFolder($folder);

	                $uploadPath = $dropzone->getTempPath();

	                $fs = new Filesystem();

                    if (!$fs->exists($uploadPath)) {
                        $fs->mkdir($uploadPath);
                    }

                    $this->validate($file);

                    $filename = uniqid() . "." . $file->getClientOriginalExtension();

                    $this->dispatchPreUploadEvent($file, $response, $request);

                    try {
                        $uploaded = $file->move($uploadPath, $filename);

                    } catch (UploadException $e) {

                        $this->errorHandler->addException($response, $e);
                    }
                    $response->offsetSet("filename", $filename);

                    $this->dispatchPostEvents($uploaded, $response, $request);


                } else {

                    $this->errorHandler->addException($response, new \Exception("Acces Denied"));

                }
            } catch (UploadException $e) {
                $this->errorHandler->addException($response, $e);
            }
        }

        return $this->createSupportedJsonResponse($response->assemble());
    }


}