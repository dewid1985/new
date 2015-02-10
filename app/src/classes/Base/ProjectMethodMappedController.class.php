<?php

/***************************************************************************
 *   Метод мапед Контроллер                                                *
 *   @author Schon Dewid  2015                                             *
 ***************************************************************************/
abstract class ProjectMethodMappedController extends PlatformBasicMethodMappedController
{
    /**
     * @return static
     */
    public static function create()
    {
        return new static();
    }

    /**
     * @param HttpRequest $request
     *
     * @return ModelAndView
     */
    public function handleRequest(HttpRequest $request)
    {
        return parent::handleRequest($request);
    }

    /**
     * @param HttpRequest $request
     *
     * @return null
     */
    public function chooseAction(HttpRequest $request)
    {
        $action = Primitive::choice('action')->setList($this->getMethodMapping());
        if ($this->getDefaultAction())
            $action->setDefault($this->getDefaultAction());
        Form::create()
            ->add($action)
            ->import($request->getGet())
            ->importMore($request->getPost())
            ->importMore($request->getAttached());
        if (!$command = $action->getValue())
            return $action->getDefault();
        return $command;
    }
}