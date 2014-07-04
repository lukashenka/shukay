<?php


namespace Shukay\DropzoneBundle\Service;

use Symfony\Component\DependencyInjection\Container;
use Symfony\Component\Filesystem\Filesystem;


class DropzoneService
{

	private $container;
	private $userName;
	private $folder = "stuff";

	public function __construct(Container $container)
	{
		$this->container = $container;
		$this->userName = $this->container->get("security.context")->getToken()->getUsername();
	}

	public function setFolder($folder)
	{
		$this->folder = $folder;
	}

	public function setUserName($userName)
	{
		$this->userName = $userName;
	}


	public function getTempPath()
	{
		return $this->getUserDirPath() . "/temp";
	}

	public function getUserDirPath()
	{
		return $this->container->get("path")->getUploadsDir() . "{$this->folder}/" . $this->userName;
	}

	public function saveImage($image)
	{
		$fs = new Filesystem();
		$fs->copy($this->getTempPath() . "/" . $image, $this->getUserDirPath() . "/" . $image);
		$fs->remove($this->getTempPath());
	}

} 