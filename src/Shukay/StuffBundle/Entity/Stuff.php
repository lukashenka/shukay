<?php

namespace Shukay\StuffBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Stuff
 *
 * @ORM\Table()
 * @ORM\Entity(repositoryClass="Shukay\StuffBundle\Entity\StuffRepository")
 * @ORM\HasLifecycleCallbacks
 */
class Stuff
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
	 * @ORM\Column(name="picture", type="string", length=255)
	 */
	private $picture;

	/**
	 * @var string
	 *
	 * @ORM\Column(name="name", type="string", length=255)
	 */
	private $name;

	/**
	 * @var string
	 *
	 * @ORM\Column(name="description", type="text",nullable=true)
	 */
	private $description;


	/**
	 * @ORM\ManyToOne(targetEntity="Shukay\UserBundle\Entity\User", inversedBy="stuff")
	 * @ORM\JoinColumn(name="user_id", referencedColumnName="id")
	 */
	private $owner;

	/**
	 * @ORM\OneToOne(targetEntity="Shukay\MapBundle\Entity\Location", inversedBy="stuff",cascade={"persist"})
	 * @ORM\JoinColumn(name="location_id", referencedColumnName="id")
	 */
	private $location;


	public $path;

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
	 * Set picture
	 *
	 * @param string $picture
	 * @return Stuff
	 */
	public function setPicture($picture)
	{
		$this->picture = $picture;

		return $this;
	}

	/**
	 * Get picture
	 *
	 * @return string
	 */
	public function getPicture()
	{
		return $this->picture;
	}

	/**
	 * Set name
	 *
	 * @param string $name
	 * @return Stuff
	 */
	public function setName($name)
	{
		$this->name = $name;

		return $this;
	}

	/**
	 * Get name
	 *
	 * @return string
	 */
	public function getName()
	{
		return $this->name;
	}

	/**
	 * Set description
	 *
	 * @param string $description
	 * @return Stuff
	 */
	public function setDescription($description)
	{
		$this->description = $description;

		return $this;
	}

	/**
	 * Get description
	 *
	 * @return string
	 */
	public function getDescription()
	{
		return $this->description;
	}


	/**
	 * Unmapped property to handle file uploads
	 */
	private $file;

	/**
	 * Sets file.
	 *
	 * @param UploadedFile $file
	 */
	public function setFile(UploadedFile $file = null)
	{
		$this->file = $file;
	}

	/**
	 * Get file.
	 *
	 * @return UploadedFile
	 */
	public function getFile()
	{
		return $this->file;
	}

	/**
	 * @ORM\PostPersist()
	 * @ORM\PostUpdate()
	 */
	public function upload()
	{
		// the file property can be empty if the field is not required
		if (null === $this->getFile()) {
			return;
		}

		// we use the original file name here but you should
		// sanitize it at least to avoid any security issues

		// move takes the target directory and target filename as params
		$this->getFile()->move(
			$this->getAbsolutePath(),
			$this->getFile()->getClientOriginalName()
		);

		// set the path property to the filename where you've saved the file
		$this->picture = $this->getFile()->getClientOriginalName();

		// clean up the file property as you won't need it anymore
		$this->setFile(null);
	}

	/**
	 * Lifecycle callback to upload the file to the server
	 */
	public function lifecycleFileUpload()
	{
		$this->upload();
	}


	public function getAbsolutePath()
	{
		return $this->getUploadRootDir() . '/' . $this->path;
	}

	public function getWebPath()
	{
		return null === $this->path
			? null
			: $this->getUploadDir() . '/' . $this->path;
	}

	protected function getUploadRootDir()
	{
		// the absolute directory path where uploaded
		// documents should be saved
		return __DIR__ . '/../../../../web/' . $this->getUploadDir();
	}

	protected function getUploadDir()
	{
		// get rid of the __DIR__ so it doesn't screw up
		// when displaying uploaded doc/image in the view.
		return 'uploads/stuff/'.$this->getOwner()->getUsername()."/";
	}

	/**
	 * Set owner
	 *
	 * @param \Shukay\UserBundle\Entity\User $owner
	 * @return Stuff
	 */
	public function setOwner(\Shukay\UserBundle\Entity\User $owner = null)
	{
		$this->owner = $owner;

		return $this;
	}

	/**
	 * Get owner
	 *
	 * @return \Shukay\UserBundle\Entity\User
	 */
	public function getOwner()
	{
		return $this->owner;
	}

	public function __construct()
	{
		$this->setPicture("");
	}

	/**
	 * Set location
	 *
	 * @param \Shukay\MapBundle\Entity\Location $location
	 * @return Stuff
	 */
	public function setLocation(\Shukay\MapBundle\Entity\Location $location = null)
	{
		$this->location = $location;

		return $this;
	}

	/**
	 * Get location
	 *
	 * @return \Shukay\MapBundle\Entity\Location
	 */
	public function getLocation()
	{
		return $this->location;
	}

    public function getPicturePath()
    {
        return $this->getUploadDir().$this->getPicture();
    }
}
