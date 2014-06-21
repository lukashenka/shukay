<?php
/**
 * Created by PhpStorm.
 * User: karachungen
 * Date: 6/20/14
 * Time: 10:51 PM
 */

namespace Shukay\MapBundle\Service;

use Symfony\Component\DependencyInjection\Container;

class GoogleApiService {

    /**
     * @var Container
     */
    private $container;

    public function __construct(Container $container)
    {
        $this->container = $container;
    }

    public function getApiToken()
    {
        $key =  $this->container->getParameter("google_api");
        return $key;
    }

} 