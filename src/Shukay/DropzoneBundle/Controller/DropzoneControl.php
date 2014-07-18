<?php
/**
 * Created by PhpStorm.
 * User: karachungen
 * Date: 7/14/14
 * Time: 7:49 PM
 */

namespace Shukay\DropzoneBundle\Controller;

use Oneup\UploaderBundle\Controller\DropzoneController as BaseController;

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
		if ($user->isGranted('IS_AUTHENTICATED_FULLY')) {
			foreach ($files as $file) {
				try {

					if (!($file instanceof FileInterface)) {
						$file = new FilesystemFile($file);
					}


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


				} catch
				(UploadException $e) {
					$this->errorHandler->addException($response, $e);
				}
			}
		} else {

			$this->errorHandler->addException($response, new \Exception("Access Denied"));

		}


		return $this->createSupportedJsonResponse($response->assemble());


	}

} 