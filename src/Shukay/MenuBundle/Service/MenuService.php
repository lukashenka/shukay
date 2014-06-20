<?php
/**
 * Created by PhpStorm.
 * User: karachungen
 * Date: 6/20/14
 * Time: 3:18 PM
 */

namespace Shukay\MenuBundle\Service;


use Symfony\Component\DependencyInjection\Container;

class MenuService
{
	private $doctrine;
	private $container;
	private $menuRepository;

	public function __construct(Container $container)
	{
		$this->container = $container;
		$this->doctrine = $this->container->get('doctrine');
		$this->menuRepository = $this->doctrine->getRepository('ShukayMenuBundle:MenuType');
	}

	public function getMainMenu()
	{
		return $this->menuRepository->getMainMenu();
	}
}