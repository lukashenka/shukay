<?php
/**
 * Created by PhpStorm.
 * User: karachungen
 * Date: 6/20/14
 * Time: 3:17 PM
 */

namespace Shukay\MenuBundle\Menu;


use Knp\Menu\FactoryInterface;
use Knp\Menu\MenuItem;
use Shukay\MenuBundle\Entity\Menu;
use Symfony\Component\DependencyInjection\ContainerAware;
use Symfony\Component\DependencyInjection\ContainerInterface;


class MenuBuilder extends ContainerAware
{

	private $factory;


	/**
	 * @param FactoryInterface $factory
	 */
	public function __construct(FactoryInterface $factory, ContainerInterface $container)
	{
		$this->factory = $factory;
		$this->setContainer($container);
	}

	public function createMainMenu()
	{

		$menuItems = $this->container->get('menu')->getMainMenu();
		/**
		 * @param MenuItem $menu
		 */
		$menu = $this->factory->createItem('root');
		$menu->setChildrenAttribute('class', 'nav navbar-nav');
		foreach ($menuItems as $item) {
			if ($item instanceof Menu) {

				$menu->addChild($item->getTitle(), array('route' => $item->getRoute()));

				if ($children = $item->getChildren()) {
					foreach ($children as $child) {
						if ($child instanceof Menu) {
							$menu[$item->getTitle()]
								->setAttribute('dropdown', true)
								->addChild($child->getTitle(), array('route' => $child->getRoute()));
						}
					}
				}

			}
		}

		return $menu;
	}

    public function createProfileSettingMenu()
    {

        $menuItems = $this->container->get('menu')->getProfileSettingMenu();
        /**
         * @param MenuItem $menu
         */
        $menu = $this->factory->createItem('root');
        $menu->setChildrenAttribute('class', 'nav navbar-nav');
        foreach ($menuItems as $item) {
            if ($item instanceof Menu) {

                $menu->addChild($item->getTitle(), array('route' => $item->getRoute()));

                if ($children = $item->getChildren()) {
                    foreach ($children as $child) {
                        if ($child instanceof Menu) {
                            $menu[$item->getTitle()]
                                ->setAttribute('dropdown', true)
                                ->addChild($child->getTitle(), array('route' => $child->getRoute()));
                        }
                    }
                }

            }
        }

        return $menu;
    }


}