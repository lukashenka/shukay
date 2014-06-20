<?php

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpKernel\Exception\HttpNotFoundException;
use Symfony\Component\Security\Core\Authentication\Token\AnonymousToken;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class ApiController extends Controller
{
	protected function getUserManager()
	{
		return $this->get('fos_user.user_manager');
	}

	protected function loginUser(User $user)
	{
		$security = $this->get('security.context');
		$providerKey = $this->container->getParameter('fos_user.firewall_name');
		$roles = $user->getRoles();
		$token = new UsernamePasswordToken($user, null, $providerKey, $roles);
		$security->setToken($token);
	}

	protected function logoutUser()
	{
		$security = $this->get('security.context');
		$token = new AnonymousToken(null, new User());
		$security->setToken($token);
		$this->get('session')->invalidate();
	}

	protected function checkUserPassword(User $user, $password)
	{
		$factory = $this->get('security.encoder_factory');
		$encoder = $factory->getEncoder($user);
		if (!$encoder) {
			return false;
		}
		return $encoder->isPasswordValid($user->getPassword(), $password, $user->getSalt());
	}

	/**
	 * @Route("/api/user/login.{_format}", name="api_user_login")
	 * @Template(engine="serializer")
	 */
	public function loginAction()
	{
		$request = $this->getRequest();
		$username = $request->get('username');
		$password = $request->get('password');

		$um = $this->getUserManager();
		$user = $um->findUserByUsername($username);
		if (!$user) {
			$user = $um->findUserByEmail($username);
		}

		if (!$user instanceof User) {
			throw new HttpNotFoundException("User not found");
		}
		if (!$this->checkUserPassword($user, $password)) {
			throw new AccessDeniedException("Wrong password");
		}

		$this->loginUser($user);
		return array('success' => true, 'user' => $user);
	}

	/**
	 * @Route("/api/user/logout.{_format}", name="api_user_logout")
	 * @Template(engine="serializer")
	 */
	public function logoutAction()
	{
		$this->logoutUser();
		return array('success' => true);
	}
}