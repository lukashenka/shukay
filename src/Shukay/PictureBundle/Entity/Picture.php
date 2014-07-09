<?php

namespace Shukay\PictureBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Picture
 *
 * @ORM\Table()
 * @ORM\HasLifecycleCallbacks()
 * @ORM\Entity(repositoryClass="Shukay\PictureBundle\Entity\PictureRepository")
 */
class Picture
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
     * @ORM\Column(name="path", type="string", length=255)
     */
    private $path;

    /**
     * @var \DateTime
     *
     *
     * @ORM\Column(name="uplooaded", type="datetimetz")
     */
    private $uploaded;

    /**
     * @ORM\PrePersist
     */
    public function setUploadedValue(\DateTime $uploaded)
    {
        $this->uploaded = $uploaded;
    }

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
     * Set path
     *
     * @param string $path
     * @return Picture
     */
    public function setPath($path)
    {
        $this->path = $path;

        return $this;
    }

    /**
     * Get path
     *
     * @return string 
     */
    public function getPath()
    {
        return $this->path;
    }

    /**
     * Set uplooaded
     *
     * @param \DateTime $uplooaded
     * @return Picture
     */
    public function setUploaded($uplooaded)
    {
        $this->uploaded = $uplooaded;

        return $this;
    }

    /**
     * Get uplooaded
     *
     * @return \DateTime 
     */
    public function getUploaded()
    {
        return $this->uploaded;
    }
}
