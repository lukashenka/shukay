<?php

namespace Shukay\MenuBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * MenuType
 *
 * @ORM\Table()
 * @ORM\Entity(repositoryClass="Shukay\MenuBundle\Entity\MenuTypeRepository")
 */
class MenuType
{
	/**
	 * @var integer
	 *
	 * @ORM\Column(name="id", type="integer")
	 * @ORM\Id
	 * @ORM\GeneratedValue(strategy="AUTO")
	 */
	private $id;

	/**
	 * @var string
	 *
	 * @ORM\Column(name="title", type="string", length=100)
	 */
	private $title;

	/**
	 * @ORM\OneToMany(targetEntity="Menu", mappedBy="menuTypeId")
	 */
	private $menu;


	/**
	 * Get id
	 *
	 * @return integer
	 */
	public function getId()
	{
		return $this->id;
	}

	/**
	 * Set title
	 *
	 * @param string $title
	 * @return Menu
	 */
	public function setTitle($title)
	{
		$this->title = $title;

		return $this;
	}

	/**
	 * Get title
	 *
	 * @return string
	 */
	public function getTitle()
	{
		return $this->title;
	}


	/**
	 * Constructor
	 */
	public function __construct()
	{
		$this->typeId = new \Doctrine\Common\Collections\ArrayCollection();
	}

	public function __toString()
	{
		return $this->getTitle();
	}

	/**
	 * Add menu
	 *
	 * @param \Shukay\MenuBundle\Entity\Menu $menu
	 * @return MenuType
	 */
	public function addMenu(\Shukay\MenuBundle\Entity\Menu $menu)
	{
		$this->menu[] = $menu;

		return $this;
	}

	/**
	 * Remove menu
	 *
	 * @param \Shukay\MenuBundle\Entity\Menu $menu
	 */
	public function removeMenu(\Shukay\MenuBundle\Entity\Menu $menu)
	{
		$this->menu->removeElement($menu);
	}

	/**
	 * Get menu
	 *
	 * @return \Doctrine\Common\Collections\Collection
	 */
	public function getMenu()
	{
		return $this->menu;
	}
}
