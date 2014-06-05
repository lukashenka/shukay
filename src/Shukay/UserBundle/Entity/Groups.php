<?php

namespace Shukay\UserBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use FOS\UserBundle\Entity\Group as BaseGroup;

/**
 * Groups
 *
 * @ORM\Table()
 * @ORM\Entity(repositoryClass="Shukay\UserBundle\Entity\GroupsRepository")
 */
class Groups extends BaseGroup
{
	/**
	 * @var integer
	 *
	 * @ORM\Column(name="id", type="integer")
	 * @ORM\Id
	 * @ORM\GeneratedValue(strategy="AUTO")
	 */
	protected $id;


	/**
	 * Get id
	 *
	 * @return integer
	 */
	public function getId()
	{
		return $this->id;
	}
}
