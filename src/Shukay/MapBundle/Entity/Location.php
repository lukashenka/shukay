<?php

namespace Shukay\MapBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Oh\GoogleMapFormTypeBundle\Validator\Constraints as OhAssert;

/**
 * Location
 *
 * @ORM\Table()
 * @ORM\Entity(repositoryClass="Shukay\MapBundle\Entity\LocationRepository")
 */
class Location
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
	 * @var float
	 *
	 * @ORM\Column(name="latitude", type="float")
	 */
	private $latitude;

	/**
	 * @var float
	 *
	 * @ORM\Column(name="longitude", type="float")
	 */
	private $longitude;


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
	 * Set latitude
	 *
	 * @param float $latitude
	 * @return Location
	 */
	public function setLatitude($latitude)
	{
		$this->latitude = $latitude;

		return $this;
	}

	/**
	 * Get latitude
	 *
	 * @return float
	 */
	public function getLatitude()
	{
		return $this->latitude;
	}

	/**
	 * Set longitude
	 *
	 * @param float $longitude
	 * @return Location
	 */
	public function setLongitude($longitude)
	{
		$this->longitude = $longitude;

		return $this;
	}

	/**
	 * Get longitude
	 *
	 * @return float
	 */
	public function getLongitude()
	{
		return $this->longitude;
	}

	public function setLatLng($latlng)
	{
		$this
			->setLatitude($latlng['latlng']['lat'])
			->setLongitude($latlng['latlng']['lng']);
		return $this;
	}

	/**
	 * @Assert\NotBlank()
	 * @OhAssert\LatLng()
	 */
	public function getLatLng()
	{
		return array('latlng' => array('lat' => $this->latitude, 'lng' => $this->longitude));
	}

}
