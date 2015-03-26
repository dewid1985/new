<?php

/**
 * Created by PhpStorm.
 * User: root
 * Date: 10.03.15
 * Time: 11:48
 */
class MultimediaController extends ProjectAuthMappedController
{
    Use ResponseView;
    Use StringHelper;

    /** @var  Form */
    protected $form;

    /** @var Module */
    protected $module;

    protected $previewHeight = NULL;

    protected $previewWidth = NULL;

    /**
     * @return Form
     */
    public function getForm()
    {
        return $this->form;
    }

    /**
     * @param Form $form
     */
    public function setForm(Form $form)
    {
        $this->form = $form;
    }

    /**
     * @return Module
     */
    protected function getModule()
    {
        if (is_null($this->module))
            $this->module = Module::create()->setModule(ModulesEnum::multimedia());
        return $this->module;
    }

    /**
     * @param null $previewHeight
     */
    public function setPreviewHeight($previewHeight)
    {
        $this->previewHeight = $previewHeight;
    }

    /**
     * @param null $previewWidth
     */
    public function setPreviewWidth($previewWidth)
    {
        $this->previewWidth = $previewWidth;
    }

    /**
     * @return null
     */
    public function getPreviewHeight()
    {
        return $this->previewHeight;
    }

    /**
     * @return null
     */
    public function getPreviewWidth()
    {
        return $this->previewWidth;
    }


    /**
     * @return ModelAndView
     */
    public function imageAction()
    {
        return ModelAndView::create()
            ->setModel(Model::create())
            ->setView('multimedia/image-upload');
    }

    /**
     * @param HttpRequest $request
     * @return JsonView|ModelAndView
     * @throws PlatfromModuleException
     */
    public function uploadImageAction(HttpRequest $request)
    {
        $responseView = ProjectResponseView::create();
        $moduleRequest = ModuleMultimediaAddImageOperationRequest::create();

        $this->setForm(
            $this
                ->getValidatedFormUploadedFileTextField()
                ->import($request->getPost())
        );

        if ($this->getForm()->getError('name')) {
            $responseView->setError('name', $this->getForm()->getTextualErrorFor('name'));
        } else {
            $moduleRequest->setName($this->transliterate($this->getForm()->get('name')->getValue()));
            $moduleRequest->setTitle($this->getForm()->get('name')->getValue());
        }

        if ($this->getForm()->getError('description'))
            $responseView->setError('description', $this->getForm()->getTextualErrorFor('description'));
        else
            $moduleRequest->setDescription($this->getForm()->get('description')->getValue());

        if ($this->getForm()->getError('tags'))
            $responseView->setError('tags', $this->getForm()->getTextualErrorFor('tags'));
        else
            $moduleRequest->setTags($this->getForm()->get('tags')->getValue());

        $this->setForm(
            $this
                ->getValidatedFormUploadedFile()
                ->import($request->getFiles())
        );

        if ($this->getForm()->getError('image'))
            $responseView->setError('image', $this->getForm()->getTextualErrorFor('image'));
        else
            $moduleRequest->setImages($this->getForm()->get('image')->getRawValue());

        if (!empty($responseView->getError()))
            return $this->getModelAndView(
                $responseView
                    ->setSuccess(FALSE)
                    ->setTpl('multimedia/image-editor')
            );

        $this->getModule()->getModuleObject()->setRequest(
            $moduleRequest
        );

        $this->getModule()->init(MultimediaOperationEnum::addImage());

        /** @var  ModuleMultimediaAddImageOperationResponse $response */
        $response = $this->getModule()->getModuleObject()->getResponse();

        return $this->getModelAndView(
            $responseView
                ->setSuccess(TRUE)
                ->setData('ico', $response->getIcoPath())
        );
    }

    /**
     * @return ModelAndView
     */
    public function imagesAction()
    {
        return ModelAndView::create()
            ->setModel(Model::create())
            ->setView('multimedia/images-list');
    }

    /**
     * @param HttpRequest $request
     * @return ModelAndView
     * @throws PlatfromModuleException
     */
    public function imagesListAction(HttpRequest $request)
    {
        $this->setForm($this->getValidatedImagesSearchForm()->import($request->getGet()));

        $this->getModule()->getModuleObject()->setRequest(
            ModuleMultimediaSearchOperationRequest::create()
                ->setDraw($this->getForm()->get('draw')->getValue())
                ->setOffset($this->getForm()->get('start')->getValue())
                ->setLimit($this->getForm()->get('length')->getValue())
                ->setOfUploadedAt($this->getForm()->get('of_uploaded_at')->getValue())
                ->setToUploadedAt($this->getForm()->get('to_uploaded_at')->getValue())
                ->setTitle($this->getForm()->get('title')->getValue())
                ->setDescription($this->getForm()->get('description')->getValue())
                ->setTags($this->getForm()->get('tags')->getValue())
        );

        $this->getModule()->init(MultimediaOperationEnum::searchImages());

        /** @var ModuleMultimediaSearchOperationResponse $response */
        $response = $this->getModule()->getModuleObject()->getResponse();

        return ModelAndView::create()
            ->setModel(
                Model::create()
                    ->set('draw', $response->getDraw())
                    ->set('recordsTotal', $response->getRecordsTotal())
                    ->set('recordsFiltered', $response->getRecordsFiltered())
                    ->set('data', $response->getData())
            )
            ->setView(JsonView::create());
    }

    /**
     * @return JsonView|ModelAndView
     */
    public function cropAction(HttpRequest $request)
    {
        $this->getModule()->getModuleObject()->setRequest(
            ModuleMultimediaGetImageOperationRequest::create()
                ->setSizesId($request->getAttachedVar('sizeId'))
                ->setId($request->getAttachedVar('imageId'))
        );

        $this->getModule()->init(MultimediaOperationEnum::getImage());

        /** @var ModuleMultimediaGetImageOperationResponse $image */
        $image = $this->getModule()->getModuleObject()->getResponse();

        if ($image->getImagesPreviewSizes()) {
            $this->setPreviewWidth($image->getImagesPreviewSizes()->getWidth());
            $this->setPreviewHeight($image->getImagesPreviewSizes()->getHeight());
        }

        return $this->getModelAndView(
            ProjectResponseView::create()
                ->setData('image', $image->getPreparedFile())
                ->setData('imageId', $image->getId())
                ->setData(
                    'sizes',
                    $this->preparedDataSizes($image->getImagesSizes(), $request->getAttachedVar('sizeId'))
                )
                ->setData('previewSizes', ['width' => $this->getPreviewWidth(), 'height' => $this->getPreviewHeight()])
                ->setTpl('multimedia/crop')
        );
    }

    public function cropImageAction(HttpRequest $request)
    {
        try {
            $this->setForm(
                $this
                    ->getValidatedCropImagesForm()
                    ->import($request->getPost())
            );

            if (!empty($this->getForm()->getErrors())) {
                return $this->getModelAndView(ProjectResponseView::create()->setSuccess(FALSE));
            }

            /** @var  ModuleMultimediaCropImageOperationRequest $requestModule */
            $requestModule = ModuleMultimediaCropImageOperationRequest::create()
                ->setImagesId($this->getForm()->get('imagesId')->getValue())
                ->setImagesSizeId($this->getForm()->get('imagesSizeId')->getValue())
                ->setCoordinateX($this->getForm()->get('x')->getValue())
                ->setCoordinateY($this->getForm()->get('y')->getValue())
                ->setWidth($this->getForm()->get('w')->getValue())
                ->setHeight($this->getForm()->get('h')->getValue());

            $this->getModule()->getModuleObject()->setRequest($requestModule);
            $this->getModule()->init(MultimediaOperationEnum::cropImage());

            return $this->getModelAndView(
                ProjectResponseView::create()
                    ->setSuccess(TRUE)
            );
        }catch (Exception $e)
        {
            Logger::me()->exception($e);
            return $this->getModelAndView(
                ProjectResponseView::create()->setSuccess(FALSE)
            );
        }
    }

    /**
     * @return Form
     */
    protected function getValidatedFormUploadedFile()
    {
        return Form::create()
            ->set(
                Primitive::file('image')
                    ->setAllowedMimeTypes(['image/jpeg', 'image/gif', 'image/png'])
                    ->required()
            )
            ->addCustomLabel('image', Form::WRONG, PlatformFileUploadMessageEnum::getErrorImageMimeType()->getName())
            ->addMissingLabel('image', PlatformFileUploadMessageEnum::getErrorRequiredImage()->getName());
    }

    /**
     * @return Form
     */
    protected function getValidatedFormUploadedFileTextField()
    {

        return Form::create()
            ->set(Primitive::string('name')->required())
            ->addMissingLabel('name', PlatformFileUploadMessageEnum::getErrorRequiredName()->getName())
            ->set(Primitive::string('description')->required())
            ->addMissingLabel('description', PlatformFileUploadMessageEnum::getErrorRequiredDescription()->getName())
            ->set(Primitive::string('tags')->required())
            ->addMissingLabel('tags', PlatformFileUploadMessageEnum::getErrorRequiredTags()->getName());
    }

    /**
     * @return Form
     */
    protected function getValidatedImagesSearchForm()
    {
        return Form::create()
            ->add(Primitive::integer('draw')->required())
            ->add(Primitive::integer('start')->required())
            ->add(Primitive::integer('length')->required())
            ->add(Primitive::string('title'))
            ->add(Primitive::string('description'))
            ->add(Primitive::string('tags'))
            ->add(Primitive::timestampTZ('of_uploaded_at'))
            ->add(Primitive::timestampTZ('to_uploaded_at'));
    }


    /**
     * @return Form
     */
    protected function getValidatedCropImagesForm()
    {
        return Form::create()
            ->add(Primitive::float('x')->required())
            ->add(Primitive::float('y')->required())
            ->add(Primitive::float('w')->required())
            ->add(Primitive::float('h')->required())
            ->add(Primitive::integer('imagesSizeId')->required())
            ->add(Primitive::integer('imagesId')->required());
    }


    /**
     * @param $array
     * @param null $id
     * @return array
     */
    private function preparedDataSizes($array, $id = null)
    {
        $r = [];
        foreach ($array as $k => $v) {
            if (is_null($id) && $k == 0) {
                $v['checked'] = true;
            } elseif ($v['id'] == $id) {
                $v['checked'] = true;
            } else {
                $v['checked'] = false;
            }
            $r[] = $v;
        }
        return $r;
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
            'image' => 'imageAction',
            'upload' => 'uploadImageAction',
            'images' => 'imagesAction',
            'imagesList' => 'imagesListAction',
            'crop' => 'cropAction',
            'cropImage' => 'cropImageAction'
        ];
    }
}