<?php

namespace Shukay\UserBundle;

use Symfony\Component\HttpKernel\Bundle\Bundle;

class ShukayUserBundle extends Bundle
{
	public function getParent()
	{
		return 'FOSUserBundle';
	}
}
