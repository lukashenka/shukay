<?php
/**
 * Created by PhpStorm.
 * User: karachungen
 * Date: 6/19/14
 * Time: 6:53 PM
 */

namespace Shukay\OAuthBundle\Entity;


use Doctrine\ORM\Mapping as ORM;
use FOS\OAuthServerBundle\Entity\AccessToken as BaseAccessToken;

/**
 * @ORM\Table()
 * @ORM\Entity
 */
class AccessToken extends BaseAccessToken
{
	/**
	 * @ORM\Id
	 * @ORM\Column(type="integer")
	 * @ORM\GeneratedValue(strategy="AUTO")
	 */
	protected $id;

	/**
	 * @ORM\ManyToOne(targetEntity="Client")
	 * @ORM\JoinColumn(nullable=false)
	 */
	protected $client;

	/**
	 * @ORM\ManyToOne(targetEntity="Shukay\UserBundle\Entity\User")
	 */
	protected $user;
}