<?php
/***************************************************************************
 *   Рубрики                                                               *
 *   @author Schon Dewid  2015                                             *
 ***************************************************************************/

class RubricsController extends ProjectAuthMappedController
{
    /**  */
    use ResponseView;

    /** @var Module  */
    protected $module = null;

    /**
     * @return Module
     */
    public function getModule()
    {
        if (is_null($this->module))
            $this->module = Module::create()->setModule(ModulesEnum::rubrics());
        return $this->module;
    }


    public function indexAction(HttpRequest $request)
    {
        return $this
            ->getModelAndView(
                ProjectResponseView::create()->setTpl('rubrics/index')
            );
    }


    public function getJsonRubricAction(HttpRequest $request)
    {
        $result = array();
        $this->getModule()->getModuleObject()->setRequest(array());
        $this->getModule()->init(RubricsOperationEnum::getListRubrics());
        foreach($this->getModule()->getModuleObject()->getResponse() as $rubric)
        {
            /** @var PlatformCommonRubric $rubric */
            $result[$rubric->getName()] =
                $this->replacedBySpace($rubric->getPath()).
                $rubric->getRubricData()->getShortName();
        };

        return ModelAndView::create()
            ->setView(JsonView::create())
            ->setModel(Model::create()->set('rubric', $result));
    }

    protected function replacedBySpace($path)
    {
        return implode('', array_pad(array(),count(explode('.',$path)),'&nbsp&nbsp'));
    }

    /**
     * Мапинг методов конроллера
     * Можно вернуть пустой массив если брать с учетом
     * что экшен будет тот который прописан в роут конфиге
     *
     * @return array
     */
    protected function /* array */
    getMapping()
    {
        return [
            'index' => 'indexAction',
            'getJsonRubric' => 'getJsonRubricAction'
        ];
    }
}