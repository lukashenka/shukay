<?php

namespace Shukay\UserBundle\Entity;

use FOS\UserBundle\Entity\User as BaseUser;
use Doctrine\ORM\Mapping as ORM;

/**
 * User
 *
 * @ORM\Table()
 * @ORM\Entity(repositoryClass="Shukay\UserBundle\Entity\UserRepository")
 */
class User extends BaseUser
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
	 * @ORM\OneToMany(targetEntity="Shukay\StuffBundle\Entity\Stuff", mappedBy="owner")
	 */
	private $stuff;

    /**
     * @ORM\OneToOne(targetEntity="ProfileInformation", mappedBy="user")
     */
    private $profileInformation;

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
	 * @ORM\ManyToMany(targetEntity="Shukay\UserBundle\Entity\Groups")
	 * @ORM\JoinTable(name="shukay_user_user_group",
	 *      joinColumns={@ORM\JoinColumn(name="user_id", referencedColumnName="id")},
	 *      inverseJoinColumns={@ORM\JoinColumn(name="group_id", referencedColumnName="id")}
	 * )
	 */
	protected $groups;

	/**
	 * Constructor
	 */
	public function __construct()
	{
		parent::__construct();
		$this->groups = new \Doctrine\Common\Collections\ArrayCollection();
	}


	/**
	 * Get groups
	 *
	 * @return \Doctrine\Common\Collections\Collection
	 */
	public function getGroups()
	{
		return $this->groups;
	}

	/**
	 * Add stuff
	 *
	 * @param \Shukay\StuffBundle\Entity\Stuff $stuff
	 * @return User
	 */
	public function addStuff(\Shukay\StuffBundle\Entity\Stuff $stuff)
	{
		$this->stuff[] = $stuff;

		return $this;
	}

	/**
	 * Remove stuff
	 *
	 * @param \Shukay\StuffBundle\Entity\Stuff $stuff
	 */
	public function removeStuff(\Shukay\StuffBundle\Entity\Stuff $stuff)
	{
		$this->stuff->removeElement($stuff);
	}

	/**
	 * Get stuff
	 *
	 * @return \Doctrine\Common\Collections\Collection
	 */
	public function getStuff()
	{
		return $this->stuff;
	}



    /**
     * Set profileInformation
     *
     * @param \Shukay\UserBundle\Entity\ProfileInformation $profileInformation
     * @return User
     */
    public function setProfileInformation(\Shukay\UserBundle\Entity\ProfileInformation $profileInformation = null)
    {
        $this->profileInformation = $profileInformation;

        return $this;
    }

    /**
     * Get profileInformation
     *
     * @return \Shukay\UserBundle\Entity\ProfileInformation 
     */
    public function getProfileInformation()
    {
        return $this->profileInformation;
    }


}
