<?php

use Symfony\Component\Config\Loader\LoaderInterface;
use Symfony\Component\HttpKernel\Kernel;

class AppKernel extends Kernel
{
	public function registerBundles()
	{
		$bundles = array(
			new Symfony\Bundle\FrameworkBundle\FrameworkBundle(),
			new Symfony\Bundle\SecurityBundle\SecurityBundle(),
			new Symfony\Bundle\TwigBundle\TwigBundle(),
			new Symfony\Bundle\MonologBundle\MonologBundle(),
			new Symfony\Bundle\SwiftmailerBundle\SwiftmailerBundle(),
			new Symfony\Bundle\AsseticBundle\AsseticBundle(),
			new Doctrine\Bundle\DoctrineBundle\DoctrineBundle(),
			new Sensio\Bundle\FrameworkExtraBundle\SensioFrameworkExtraBundle(),
			new Shukay\MainBundle\ShukayMainBundle(),

			new FOS\UserBundle\FOSUserBundle(),
			new Sonata\CoreBundle\SonataCoreBundle(),
			new Shukay\UserBundle\ShukayUserBundle(),

			new Shukay\AdminBundle\ShukayAdminBundle(),

			new Sonata\BlockBundle\SonataBlockBundle(),
			new Sonata\jQueryBundle\SonatajQueryBundle(),
			new Knp\Bundle\MenuBundle\KnpMenuBundle(),

			new Sonata\DoctrineORMAdminBundle\SonataDoctrineORMAdminBundle(),
			new Sonata\AdminBundle\SonataAdminBundle(),
			new Shukay\StuffBundle\ShukayStuffBundle(),
			new Sonata\EasyExtendsBundle\SonataEasyExtendsBundle(),
			new Shukay\MapBundle\ShukayMapBundle(),
			new JMS\SerializerBundle\JMSSerializerBundle(),
			new FOS\OAuthServerBundle\FOSOAuthServerBundle(),
			new Shukay\OAuthBundle\ShukayOAuthBundle(),
			new Shukay\MenuBundle\ShukayMenuBundle(),
		);

		if (in_array($this->getEnvironment(), array('dev', 'test'))) {

			$bundles[] = new Symfony\Bundle\WebProfilerBundle\WebProfilerBundle();
			$bundles[] = new Sensio\Bundle\DistributionBundle\SensioDistributionBundle();
			$bundles[] = new Sensio\Bundle\GeneratorBundle\SensioGeneratorBundle();
		}

		return $bundles;
	}

	public function registerContainerConfiguration(LoaderInterface $loader)
	{
		$loader->load(__DIR__ . '/config/config_' . $this->getEnvironment() . '.yml');
	}

	public function getRootDir()
	{
		return realpath(parent::getRootDir());
	}
}
