<?php

namespace Shukay\MenuBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Menu
 *
 * @ORM\Table()
 * @ORM\Entity
 */
class Menu
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
	 * @var string
	 *
	 * @ORM\Column(name="route", type="string", length=100)
	 */
	private $route;

	/**
	 * @var string
	 *
	 * @ORM\Column(name="alias", type="string", length=255)
	 */
	private $alias;

	/**
	 * @var boolean
	 *
	 * @ORM\Column(name="static", type="boolean")
	 */
	private $static;


	/**
	 * @ORM\ManyToOne(targetEntity="Shukay\MenuBundle\Entity\MenuType", inversedBy="menu")
	 * @ORM\JoinColumn(name="menuTypeId", referencedColumnName="id")
	 */
	protected $menuTypeId;


	/**
	 * @ORM\ManyToOne(targetEntity="Menu", inversedBy="children")
	 * @ORM\JoinColumn(name="parent_id", referencedColumnName="id", onDelete="CASCADE")
	 */
	protected $parent;

	/**
	 * @ORM\OneToMany(targetEntity="Menu", mappedBy="parent")
	 */
	protected $children;


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
	 * @return MenuType
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
	 * Set route
	 *
	 * @param string $route
	 * @return MenuType
	 */
	public function setRoute($route)
	{
		$this->route = $route;

		return $this;
	}

	/**
	 * Get route
	 *
	 * @return string
	 */
	public function getRoute()
	{
		return $this->route;
	}

	/**
	 * Set alias
	 *
	 * @param string $alias
	 * @return MenuType
	 */
	public function setAlias($alias)
	{
		$this->alias = $alias;

		return $this;
	}

	/**
	 * Get alias
	 *
	 * @return string
	 */
	public function getAlias()
	{
		return $this->alias;
	}

	/**
	 * Set static
	 *
	 * @param boolean $static
	 * @return MenuType
	 */
	public function setStatic($static)
	{
		$this->static = $static;

		return $this;
	}

	/**
	 * Get static
	 *
	 * @return boolean
	 */
	public function getStatic()
	{
		return $this->static;
	}

	/**
	 * Set menuTypeId
	 *
	 * @param \Shukay\MenuBundle\Entity\MenuType $menuTypeId
	 * @return Menu
	 */
	public function setMenuTypeId(\Shukay\MenuBundle\Entity\MenuType $menuTypeId = null)
	{
		$this->menuTypeId = $menuTypeId;

		return $this;
	}

	/**
	 * Get menuTypeId
	 *
	 * @return \Shukay\MenuBundle\Entity\MenuType
	 */
	public function getMenuTypeId()
	{
		return $this->menuTypeId;
	}


	public function __construct()
	{
		$this->children = new \Doctrine\Common\Collections\ArrayCollection();
	}

	/**
	 * Set parent
	 *
	 * @param \Shukay\MenuBundle\Entity\Menu $parent
	 * @return Menu
	 */
	public function setParent(\Shukay\MenuBundle\Entity\Menu $parent = null)
	{
		$this->parent = $parent;

		return $this;
	}

	/**
	 * Get parent
	 *
	 * @return \Shukay\MenuBundle\Entity\Menu
	 */
	public function getParent()
	{
		return $this->parent;
	}

	/**
	 * Add children
	 *
	 * @param \Shukay\MenuBundle\Entity\Menu $children
	 * @return Menu
	 */
	public function addChild(\Shukay\MenuBundle\Entity\Menu $children)
	{
		$this->children[] = $children;

		return $this;
	}

	/**
	 * Remove children
	 *
	 * @param \Shukay\MenuBundle\Entity\Menu $children
	 */
	public function removeChild(\Shukay\MenuBundle\Entity\Menu $children)
	{
		$this->children->removeElement($children);
	}

	/**
	 * Get children
	 *
	 * @return \Doctrine\Common\Collections\Collection
	 */
	public function getChildren()
	{
		return $this->children;
	}

	public function __toString()
	{
		return $this->getTitle();
	}
}
