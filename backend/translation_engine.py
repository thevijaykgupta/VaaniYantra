import logging
from .config import TRANSLATION_BACKEND
from .utils import run_blocking

logger = logging.getLogger("translator")

class Translator:
    """
    Translation engine supporting local Marian or M2M100 models, or a cloud placeholder.
    """
    def __init__(self, backend=TRANSLATION_BACKEND):
        self.backend = backend
        self.models = {}

    def translate(self, text: str, source_lang="auto", target_lang="en") -> str:
        if not text.strip():
            return ""
        try:
            if self.backend == "marian":
                return self._translate_marian(text, source_lang, target_lang)
            elif self.backend == "m2m100":
                return self._translate_m2m100(text, source_lang, target_lang)
            else:  # cloud
                return self._translate_cloud(text, source_lang, target_lang)
        except Exception:
            logger.exception("Translation failed, returning original text")
            return text

    def _translate_marian(self, text, source_lang, target_lang):
        """Use MarianMT models for translation."""
        from transformers import MarianMTModel, MarianTokenizer

        model_name = f"Helsinki-NLP/opus-mt-{source_lang}-{target_lang}"
        if model_name not in self.models:
            tokenizer = MarianTokenizer.from_pretrained(model_name)
            model = MarianMTModel.from_pretrained(model_name)
            self.models[model_name] = (tokenizer, model)

        tokenizer, model = self.models[model_name]
        batch = tokenizer([text], return_tensors="pt", padding=True)
        generated = model.generate(**batch, max_length=256)
        return tokenizer.decode(generated[0], skip_special_tokens=True)

    def _translate_m2m100(self, text, source_lang, target_lang):
        """Use M2M100 models for multilingual translation."""
        from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer

        model_name = "facebook/m2m100_418M"
        if model_name not in self.models:
            tokenizer = M2M100Tokenizer.from_pretrained(model_name)
            model = M2M100ForConditionalGeneration.from_pretrained(model_name)
            self.models[model_name] = (tokenizer, model)

        tokenizer, model = self.models[model_name]

        tokenizer.src_lang = source_lang
        encoded = tokenizer(text, return_tensors="pt")
        generated_tokens = model.generate(
            **encoded, forced_bos_token_id=tokenizer.get_lang_id(target_lang)
        )
        return tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]

    def _translate_cloud(self, text, source_lang, target_lang):
        """Placeholder for cloud translation service."""
        logger.info("Using cloud translation (placeholder)")
        return f"[TRANSLATED TO {target_lang.upper()}] {text}"


