<?php
/***************************************************************************
 *   Метод мапед Контроллер с проверкой аторизации                         *
 *   @author Schon Dewid  2015                                             *
 ***************************************************************************/
abstract class ProjectAuthMappedController extends ProjectMethodMappedController
{
    /**
     * @param HttpRequest $request
     *
     * @return ModelAndView
     */
    public function handleRequest(HttpRequest $request)
    {

        if(PlatformAuthAdminProcessor::create()->isAuthorized()->isResult())
                    return parent::handleRequest($request);

        return ModelAndView::create()
            ->setModel(Model::create())
            ->setView(RedirectView::create('/auth'));
    }

    /**
     * @return PlatformCommonProject
     */
    public function getProject()
    {
        return PlatformCommonProject::dao()->getById(Session::get('projectId'));
    }

    /**
     * @return PlatformUsersAdmin
     */
    public function getAdmin()
    {
        return PlatformUsersAdmin::dao()->getById(Session::get('uId'));
    }
}