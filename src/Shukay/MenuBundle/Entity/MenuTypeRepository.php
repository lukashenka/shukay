<?php
/**
 * Created by PhpStorm.
 * User: karachungen
 * Date: 6/20/14
 * Time: 3:20 PM
 */

namespace Shukay\MenuBundle\Entity;

use Doctrine\ORM\EntityRepository;


class MenuTypeRepository extends EntityRepository
{
	public function getMainMenu()
	{
		$menuType = $this->findOneByTitle("MainMenu");
		if ($menuType instanceof MenuType) {
			return $this->getRootMenu($menuType);
		} else {
			throw new \Doctrine\ORM\NoResultException();
			return null;
		}
	}

	public function getRootMenu($menuTypeId)
	{
		$query = $this->getEntityManager()
			->createQuery(
				'SELECT m FROM ShukayMenuBundle:Menu m
					WHERE
					m.menuTypeId = :menuTypeId
					AND
					m.parent IS NULL
					'
			)
			->setParameters(array('menuTypeId' => $menuTypeId));


		try {
			return $query->getResult();
		} catch (\Doctrine\ORM\NoResultException $e) {
			return null;
		}
	}
}